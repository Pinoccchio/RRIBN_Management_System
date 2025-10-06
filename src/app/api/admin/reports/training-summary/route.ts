import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/reports/training-summary
 *
 * Fetch battalion-wide training attendance summary for report generation
 * Returns ALL training sessions with attendance statistics (admin has full access)
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/reports/training-summary' });

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

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access battalion training summary report', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    logger.info('Fetching battalion-wide training summary data (admin)');

    // Fetch ALL training sessions (no company filter)
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

    // Fetch registration statistics for each session
    const trainingSummary = await Promise.all(
      (sessions || []).map(async (session: any) => {
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

    // Get unique companies for metadata
    const companies = [...new Set(
      trainingSummary
        .map(t => t.company)
        .filter(c => c !== 'All Companies')
    )];

    logger.success(`Fetched ${trainingSummary.length} training sessions for battalion summary report`, {
      count: trainingSummary.length,
      companiesCount: companies.length,
      companies,
    });

    return NextResponse.json({
      success: true,
      data: trainingSummary,
      companies,
      metadata: {
        totalSessions: trainingSummary.length,
        companiesCount: companies.length,
        systemWideCount: trainingSummary.filter(t => t.company === 'All Companies').length,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in training summary report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
