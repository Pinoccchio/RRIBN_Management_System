import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/reports/roster
 *
 * Fetch battalion-wide roster data for report generation
 * Returns all reservists across all companies (admin has full access)
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/reports/roster' });

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
      logger.error('Non-admin user attempted to access battalion roster report', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    logger.info('Fetching battalion-wide roster data (admin)');

    // Fetch ALL reservists across ALL companies (no company filter)
    const { data: reservists, error: fetchError } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .order('company', { ascending: true })
      .order('rank', { ascending: false })
      .order('last_name', { ascending: true });

    if (fetchError) {
      logger.error('Failed to fetch roster data', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch roster data' },
        { status: 500 }
      );
    }

    // Transform data for report
    const rosterData = (reservists || []).map((r: any) => ({
      id: r.id,
      serviceNumber: r.service_number || 'N/A',
      rank: r.rank || 'N/A',
      lastName: r.last_name || '',
      firstName: r.first_name || '',
      middleName: r.middle_name || '',
      company: r.company || 'N/A',
      phone: r.phone || 'N/A',
      email: r.email || 'N/A',
      accountStatus: r.status || 'N/A',
      reservistStatus: r.reservist_status || 'N/A',
      lastLogin: r.last_login_at || null,
      createdAt: r.created_at || null,
    }));

    // Get unique companies for metadata
    const companies = [...new Set(rosterData.map(r => r.company))].filter(c => c !== 'N/A');

    logger.success(`Fetched ${rosterData.length} reservists for battalion roster report`, {
      count: rosterData.length,
      companiesCount: companies.length,
      companies,
    });

    return NextResponse.json({
      success: true,
      data: rosterData,
      companies,
      metadata: {
        totalReservists: rosterData.length,
        companiesCount: companies.length,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in roster report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
