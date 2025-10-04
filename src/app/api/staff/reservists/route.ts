import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Reservist, ReservistViewData, PaginatedResponse } from '@/lib/types/reservist';

/**
 * GET /api/staff/reservists
 * List reservists in staff member's assigned companies
 * COMPANY-FILTERED: Only shows reservists in companies assigned to the staff member
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reservists' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/reservists' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/reservists',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/reservists',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/staff/reservists', userId: user.id });

    // Get staff's assigned companies
    logger.dbQuery('SELECT', 'staff_details', `Fetching assigned companies for user: ${user.id.substring(0, 8)}...`);
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      logger.info('No assigned companies - Returning empty list', {
        context: 'GET /api/staff/reservists',
        userId: user.id
      });
      logger.separator();

      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    }

    logger.dbSuccess('SELECT', 'staff_details');
    const assignedCompanies = staffDetails.assigned_companies;
    logger.debug(`Assigned companies: ${assignedCompanies.join(', ')}`, { context: 'GET /api/staff/reservists' });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const company = searchParams.get('company') || ''; // Staff can still filter within their companies
    const rank = searchParams.get('rank') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    logger.debug(`Filters: status=${status}, company=${company}, rank=${rank}, search=${search}, page=${page}`, {
      context: 'GET /api/staff/reservists'
    });

    // Build query using the pre-joined view
    let query = supabase
      .from('reservist_accounts_with_details')
      .select('*', { count: 'exact' })
      .in('company', assignedCompanies); // KEY FILTER: Only assigned companies

    // Apply additional filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (company && assignedCompanies.includes(company)) {
      // Staff can filter by specific company within their assigned companies
      query = query.eq('company', company);
    }

    if (rank) {
      query = query.eq('rank', rank);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,service_number.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    logger.dbQuery('SELECT', 'reservist_accounts_with_details', `Fetching reservists list (page ${page}, companies: ${assignedCompanies.join(',')})`);
    const { data, error, count } = await query;

    if (error) {
      logger.dbError('SELECT', 'reservist_accounts_with_details', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch reservists' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'reservist_accounts_with_details');

    // Transform data from flat view structure to nested Reservist type
    const reservists: Reservist[] = (data || []).map((res: ReservistViewData) => ({
      id: res.id,
      email: res.email,
      role: 'reservist' as const,
      status: res.status as 'pending' | 'active' | 'inactive' | 'deactivated',
      created_at: res.created_at,
      updated_at: res.updated_at,
      created_by: res.created_by,
      approved_by: res.approved_by,
      approved_at: res.approved_at,
      last_login_at: res.last_login_at,
      rejection_reason: res.rejection_reason,
      profile: {
        first_name: res.first_name,
        middle_name: res.middle_name,
        last_name: res.last_name,
        phone: res.phone,
        profile_photo_url: res.profile_photo_url,
      },
      reservist_details: {
        id: res.id,
        service_number: res.service_number,
        afpsn: res.afpsn,
        rank: res.rank,
        company: res.company,
        commission_type: res.commission_type as any,
        date_of_birth: res.date_of_birth,
        address: res.address,
        emergency_contact_name: res.emergency_contact_name,
        emergency_contact_phone: res.emergency_contact_phone,
        reservist_status: res.reservist_status as any,
        br_svc: res.br_svc,
        mos: res.mos,
        source_of_commission: res.source_of_commission,
        initial_rank: res.initial_rank,
        date_of_commission: res.date_of_commission,
        commission_authority: null,
        mobilization_center: null,
        designation: null,
        squad_team_section: null,
        platoon: null,
        battalion_brigade: null,
        combat_shoes_size: null,
        cap_size: null,
        bda_size: null,
        created_at: res.created_at,
        updated_at: res.updated_at,
      },
      approver: res.approver_first_name && res.approver_last_name ? {
        first_name: res.approver_first_name,
        last_name: res.approver_last_name,
      } : null,
    }));

    const response: PaginatedResponse<Reservist> = {
      data: reservists,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    logger.success(`Fetched ${reservists.length} reservists from assigned companies (total: ${count})`, {
      context: 'GET /api/staff/reservists'
    });
    logger.separator();

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/reservists' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
