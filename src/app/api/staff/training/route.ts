import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { TrainingSession, CreateTrainingInput } from '@/lib/types/training';

/**
 * GET /api/staff/training
 *
 * List all training sessions for staff's assigned companies
 *
 * Query params:
 * - status: Filter by training status (scheduled, ongoing, completed, cancelled)
 * - company: Filter by specific company code
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
      logger.error('Unauthorized access attempt to training list', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to access staff training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch staff details' }, { status: 500 });
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    if (assignedCompanies.length === 0) {
      logger.warn('Staff has no assigned companies', { userId: user.id });
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const companyFilter = searchParams.get('company');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('Fetching training sessions for staff', {
      userId: user.id,
      assignedCompanies,
      filters: { status: statusFilter, company: companyFilter, limit, offset },
    });

    // Build query for training sessions
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

    // Apply company filter (must be in assigned companies)
    if (companyFilter) {
      if (assignedCompanies.includes(companyFilter)) {
        query = query.eq('company', companyFilter);
      } else {
        logger.warn('Staff attempted to filter by unassigned company', {
          userId: user.id,
          attemptedCompany: companyFilter,
          assignedCompanies,
        });
        return NextResponse.json({ success: true, data: [], total: 0 });
      }
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch training sessions', error, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch training sessions' }, { status: 500 });
    }

    // Filter by assigned companies (application-level filtering)
    const filteredData = (data || []).filter((session: any) => {
      if (!session.company) {
        // System-wide training (no company restriction) - include it
        return true;
      }
      return assignedCompanies.includes(session.company);
    });

    // Fetch registration statistics for each training session
    const trainingsWithStats = await Promise.all(
      filteredData.map(async (training: any) => {
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
          pending_count: registrations?.filter((r) => r.completion_status === 'pending' || r.completion_status === null).length || 0,
        };

        return {
          ...training,
          ...stats,
        };
      })
    );

    logger.success(`Fetched ${trainingsWithStats.length} training sessions for staff`, {
      userId: user.id,
      total: trainingsWithStats.length,
    });

    return NextResponse.json({
      success: true,
      data: trainingsWithStats,
      total: trainingsWithStats.length,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/staff/training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/staff/training
 *
 * Create a new training session
 *
 * Body: CreateTrainingInput
 *
 * Returns: Created training session
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

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to create training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch staff details' }, { status: 500 });
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    // Parse request body
    const body: CreateTrainingInput = await request.json();

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    if (!body.scheduled_date) {
      return NextResponse.json({ success: false, error: 'Scheduled date is required' }, { status: 400 });
    }

    // Validate company is in assigned companies (if specified)
    if (body.company) {
      if (!assignedCompanies.includes(body.company)) {
        logger.warn('Staff attempted to create training for unassigned company', {
          userId: user.id,
          attemptedCompany: body.company,
          assignedCompanies,
        });
        return NextResponse.json(
          { success: false, error: 'Cannot create training for company not assigned to you' },
          { status: 403 }
        );
      }
    }

    // Validate capacity
    if (body.capacity !== undefined && body.capacity !== null && body.capacity <= 0) {
      return NextResponse.json({ success: false, error: 'Capacity must be greater than 0' }, { status: 400 });
    }

    // Validate dates
    const scheduledDate = new Date(body.scheduled_date);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid scheduled date' }, { status: 400 });
    }

    if (body.end_date) {
      const endDate = new Date(body.end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid end date' }, { status: 400 });
      }
      if (endDate < scheduledDate) {
        return NextResponse.json({ success: false, error: 'End date must be after scheduled date' }, { status: 400 });
      }
    }

    logger.info('Creating new training session', {
      userId: user.id,
      title: body.title,
      company: body.company,
    });

    // Create training session
    const { data, error } = await supabase
      .from('training_sessions')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        company: body.company || null,
        training_category: body.training_category || 'Other',
        scheduled_date: body.scheduled_date,
        end_date: body.end_date || null,
        location: body.location?.trim() || null,
        capacity: body.capacity || null,
        prerequisites: body.prerequisites?.trim() || null,
        created_by: user.id,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create training session', error, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to create training session' }, { status: 500 });
    }

    logger.success('Training session created successfully', {
      userId: user.id,
      trainingId: data.id,
      title: data.title,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected error in POST /api/staff/training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
