import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/training-sessions
 *
 * Alias endpoint for staff dashboard - returns training sessions in camelCase format
 * Filters by staff's assigned companies and returns scheduled/ongoing sessions
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
      logger.error('Unauthorized access attempt to training sessions', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to access staff training sessions', {
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
      return NextResponse.json({ success: true, data: [] });
    }

    logger.info('Fetching training sessions for staff dashboard', {
      userId: user.id,
      assignedCompanies,
    });

    // Fetch training sessions (scheduled and ongoing only)
    const { data, error } = await supabase
      .from('training_sessions')
      .select(`
        id,
        title,
        company,
        training_category,
        scheduled_date,
        status,
        capacity
      `)
      .in('status', ['scheduled', 'ongoing'])
      .order('scheduled_date', { ascending: true });

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

    // Transform to camelCase format expected by dashboard
    const transformedData = filteredData.map((session: any) => ({
      id: session.id,
      title: session.title,
      company: session.company,
      scheduledDate: session.scheduled_date,
      status: session.status,
      trainingCategory: session.training_category,
      capacity: session.capacity,
    }));

    logger.success(`Fetched ${transformedData.length} training sessions for staff dashboard`, {
      userId: user.id,
      total: transformedData.length,
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/staff/training-sessions', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
