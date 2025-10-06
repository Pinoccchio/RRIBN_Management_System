import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reservists/simple
 * Simplified endpoint for reservist selection in RIDS creation
 * Returns flat structure with only essential fields for display
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reservists/simple' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/reservists/simple' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/reservists/simple',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/reservists/simple',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/staff/reservists/simple', userId: user.id });

    // Get staff's assigned companies
    logger.dbQuery('SELECT', 'staff_details', `Fetching assigned companies for user: ${user.id.substring(0, 8)}...`);
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      logger.info('No assigned companies - Returning empty list', {
        context: 'GET /api/staff/reservists/simple',
        userId: user.id
      });
      logger.separator();

      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    logger.dbSuccess('SELECT', 'staff_details');
    const assignedCompanies = staffDetails.assigned_companies;
    logger.debug(`Assigned companies: ${assignedCompanies.join(', ')}`, { context: 'GET /api/staff/reservists/simple' });

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Query with explicit column selection for flat structure
    // Include LEFT JOIN with rids_forms to check if reservist already has RIDS
    logger.dbQuery('SELECT', 'accounts, profiles, reservist_details, rids_forms', `Fetching simplified reservists list with RIDS status`);

    let query = supabase
      .from('accounts')
      .select(`
        id,
        email,
        profiles!inner (
          first_name,
          middle_name,
          last_name
        ),
        reservist_details!inner (
          service_number,
          rank,
          company,
          squad_team_section
        ),
        rids_forms!rids_forms_reservist_id_fkey (
          id,
          status
        )
      `)
      .eq('role', 'reservist')
      .in('reservist_details.company', assignedCompanies);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply limit
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      logger.dbError('SELECT', 'accounts', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch reservists' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Transform nested Supabase response to flat structure
    // Include RIDS status information for duplicate prevention
    const flattenedData = (data || []).map((item: any) => {
      // rids_forms is an array (LEFT JOIN), take first element if exists
      const ridsData = item.rids_forms && item.rids_forms.length > 0 ? item.rids_forms[0] : null;

      return {
        id: item.id,
        email: item.email,
        first_name: item.profiles.first_name,
        middle_name: item.profiles.middle_name,
        last_name: item.profiles.last_name,
        service_number: item.reservist_details.service_number,
        rank: item.reservist_details.rank,
        company: item.reservist_details.company,
        section: item.reservist_details.squad_team_section,
        // RIDS status information
        has_rids: !!ridsData,
        rids_id: ridsData?.id || null,
        rids_status: ridsData?.status || null,
      };
    });

    logger.success(`Fetched ${flattenedData.length} reservists (simplified)`, {
      context: 'GET /api/staff/reservists/simple'
    });
    logger.separator();

    return NextResponse.json({ success: true, data: flattenedData });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/reservists/simple' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
