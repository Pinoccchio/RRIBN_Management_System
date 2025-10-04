import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Reservist, ReservistViewData, PaginatedResponse, ReservistFilters } from '@/lib/types/reservist';

/**
 * GET /api/admin/reservists
 * List all reservists with filtering and pagination
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/reservists' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/admin/reservists' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/admin/reservists',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: accountData } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!accountData || !['admin', 'super_admin'].includes(accountData.role)) {
      logger.warn('Insufficient permissions - Admin or Super Admin role required', {
        context: 'GET /api/admin/reservists',
        userId: user.id,
        role: accountData?.role
      });
      return NextResponse.json({ success: false, error: 'Forbidden: Only administrators can access this resource' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/admin/reservists', userId: user.id });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const company = searchParams.get('company') || '';
    const rank = searchParams.get('rank') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    logger.debug(`Filters: status=${status}, company=${company}, rank=${rank}, search=${search}, page=${page}`, {
      context: 'GET /api/admin/reservists'
    });

    // Build query using the pre-joined view
    let query = supabase
      .from('reservist_accounts_with_details')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (company) {
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

    logger.dbQuery('SELECT', 'reservist_accounts_with_details', `Fetching reservists list (page ${page})`);
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

    logger.success(`Fetched ${reservists.length} reservists (total: ${count})`, {
      context: 'GET /api/admin/reservists'
    });
    logger.separator();

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/admin/reservists' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
