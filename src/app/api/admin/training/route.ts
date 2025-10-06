import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { TrainingSession, CreateTrainingInput } from '@/lib/types/training';

/**
 * GET /api/admin/training
 *
 * List all training sessions (battalion-wide) for admin users
 *
 * Query params:
 * - status: Filter by training status (scheduled, ongoing, completed, cancelled)
 * - company: Filter by specific company code (optional)
 * - limit: Number of records to return (default: 100)
 * - offset: Pagination offset (default: 0)
 *
 * Returns: Array of training sessions with registration statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to admin training list', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access admin training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const companyFilter = searchParams.get('company');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('Fetching training sessions for admin', {
      userId: user.id,
      role: account.role,
      filters: { status: statusFilter, company: companyFilter, limit, offset },
    });

    // Build query for training sessions (battalion-wide, no company restriction)
    let query = supabase
      .from('training_sessions')
      .select(`
        id,
        title,
        description,
        company,
        training_category,
        scheduled_date,
        end_date,
        location,
        capacity,
        prerequisites,
        created_by,
        status,
        created_at,
        updated_at
      `)
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    // Apply optional company filter (admin can filter by any company)
    if (companyFilter) {
      query = query.eq('company', companyFilter);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch training sessions', error, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch training sessions' }, { status: 500 });
    }

    // Fetch registration statistics for each training session
    const trainingsWithStats = await Promise.all(
      (data || []).map(async (training: any) => {
        const { data: registrations } = await supabase
          .from('training_registrations')
          .select('status, completion_status')
          .eq('training_session_id', training.id);

        const stats = {
          // Only count active registrations (exclude 'cancelled' and 'no_show')
          registration_count: registrations?.filter((r) =>
            r.status === 'registered' || r.status === 'attended' || r.status === 'completed'
          ).length || 0,
          attended_count: registrations?.filter((r) => r.status === 'attended' || r.status === 'completed').length || 0,
          completed_count: registrations?.filter((r) => r.status === 'completed').length || 0,
          passed_count: registrations?.filter((r) => r.completion_status === 'passed').length || 0,
          failed_count: registrations?.filter((r) => r.completion_status === 'failed').length || 0,
          pending_count: registrations?.filter((r) => r.completion_status === 'pending').length || 0,
        };

        return {
          ...training,
          ...stats,
        };
      })
    );

    logger.success('Training sessions fetched successfully', {
      userId: user.id,
      count: trainingsWithStats.length,
    });

    return NextResponse.json({
      success: true,
      data: trainingsWithStats,
      total: trainingsWithStats.length,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/admin/training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/training
 *
 * Create a new training session (admin can create for any company or system-wide)
 *
 * Body: CreateTrainingInput
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to create training', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to create training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Parse request body
    const body: CreateTrainingInput = await request.json();

    // Validate required fields
    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Title is required (min 3 characters)' }, { status: 400 });
    }

    if (!body.scheduled_date) {
      return NextResponse.json({ success: false, error: 'Scheduled date is required' }, { status: 400 });
    }

    // Validate end_date if provided
    if (body.end_date) {
      const scheduledDate = new Date(body.scheduled_date);
      const endDate = new Date(body.end_date);
      if (endDate <= scheduledDate) {
        return NextResponse.json({ success: false, error: 'End date must be after scheduled date' }, { status: 400 });
      }
    }

    // Validate capacity if provided
    if (body.capacity !== null && body.capacity !== undefined && body.capacity <= 0) {
      return NextResponse.json({ success: false, error: 'Capacity must be greater than 0' }, { status: 400 });
    }

    // Note: Admin can create training for ANY company or system-wide (company = null)
    // No company validation needed for admin

    logger.info('Creating training session', {
      userId: user.id,
      title: body.title,
      company: body.company || 'system-wide',
    });

    // Insert training session
    const { data: training, error: insertError } = await supabase
      .from('training_sessions')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        company: body.company || null, // null = system-wide
        training_category: body.training_category || null,
        scheduled_date: body.scheduled_date,
        end_date: body.end_date || null,
        location: body.location?.trim() || null,
        capacity: body.capacity || null,
        prerequisites: body.prerequisites?.trim() || null,
        created_by: user.id,
        status: 'scheduled', // Always start as scheduled
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Failed to create training session', insertError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to create training session' }, { status: 500 });
    }

    logger.success('Training session created successfully', {
      userId: user.id,
      trainingId: training.id,
      title: training.title,
    });

    return NextResponse.json({
      success: true,
      data: training,
      message: 'Training session created successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/admin/training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
