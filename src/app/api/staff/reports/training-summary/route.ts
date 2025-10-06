import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reports/training-summary
 *
 * Fetch training attendance summary for report generation
 * Returns training sessions with attendance statistics for assigned companies
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reports/training-summary' });

  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get staff details and assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Staff details not found', staffError);
      return NextResponse.json(
        { success: false, error: 'Staff details not found' },
        { status: 404 }
      );
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    if (assignedCompanies.length === 0) {
      logger.info('No assigned companies - Returning empty data');
      return NextResponse.json({ success: true, data: [] });
    }

    logger.info('Fetching training summary data for companies', { assignedCompanies });

    // Fetch all training sessions for assigned companies
    const { data: sessions, error: fetchError } = await supabase
      .from('training_sessions')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (fetchError) {
      logger.error('Failed to fetch training sessions', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch training sessions' },
        { status: 500 }
      );
    }

    // Filter by assigned companies (include null company = system-wide)
    const filteredSessions = (sessions || []).filter((session: any) => {
      if (!session.company) return true; // System-wide training
      return assignedCompanies.includes(session.company);
    });

    // Fetch registration statistics for each session
    const trainingSummary = await Promise.all(
      filteredSessions.map(async (session: any) => {
        const { data: registrations } = await supabase
          .from('training_registrations')
          .select('status, completion_status')
          .eq('training_session_id', session.id);

        const registered = registrations?.filter(
          (r) =>
            r.status === 'registered' ||
            r.status === 'attended' ||
            r.status === 'completed'
        ).length || 0;

        const attended = registrations?.filter(
          (r) => r.status === 'attended' || r.status === 'completed'
        ).length || 0;

        const completed =
          registrations?.filter((r) => r.status === 'completed').length || 0;

        const noShow =
          registrations?.filter((r) => r.status === 'no_show').length || 0;

        const completionRate =
          registered > 0 ? Math.round((completed / registered) * 100) : 0;

        return {
          id: session.id,
          title: session.title || 'Untitled',
          date: session.scheduled_date || null,
          location: session.location || 'N/A',
          company: session.company || 'All Companies',
          category: session.training_category || 'Other',
          status: session.status || 'scheduled',
          capacity: session.capacity || null,
          registered,
          attended,
          completed,
          noShow,
          completionRate,
        };
      })
    );

    logger.success(`Fetched ${trainingSummary.length} training sessions for summary report`, {
      count: trainingSummary.length,
      companies: assignedCompanies,
    });

    return NextResponse.json({
      success: true,
      data: trainingSummary,
      companies: assignedCompanies,
    });
  } catch (error) {
    logger.error('Unexpected error in training summary report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
