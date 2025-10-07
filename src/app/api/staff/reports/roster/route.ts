import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reports/roster
 *
 * Fetch company roster data for report generation
 * Returns all reservists in staff's assigned companies
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reports/roster' });

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

    logger.info('Fetching roster data for companies', { assignedCompanies });

    // Fetch all NCO reservists in assigned companies using the optimized view
    // System Scope: Filter for NCO personnel only (4 ranks)
    const { data: reservists, error: fetchError } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .in('company', assignedCompanies)
      .eq('commission_type', 'NCO') // NCO only filter
      .in('rank', ['Private', 'Private First Class', 'Corporal', 'Sergeant'])
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

    logger.success(`Fetched ${rosterData.length} reservists for roster report`, {
      count: rosterData.length,
      companies: assignedCompanies,
    });

    return NextResponse.json({
      success: true,
      data: rosterData,
      companies: assignedCompanies,
    });
  } catch (error) {
    logger.error('Unexpected error in roster report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
