import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidEmail, sanitizeInput } from '@/lib/utils/validation';
import { logger } from '@/lib/logger';
import type { CreateStaffInput, StaffMember, PaginatedResponse, StaffFilters } from '@/lib/types/staff';

/**
 * GET /api/admin/staff
 * List all staff members with filtering and pagination
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/staff' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/admin/staff' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/admin/staff',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      logger.warn('Insufficient permissions - Admin role required', {
        context: 'GET /api/admin/staff',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden: Only administrators can access this resource' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/admin/staff', userId: user.id });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const company = searchParams.get('company') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    logger.debug(`Filters: status=${status}, company=${company}, search=${search}, page=${page}`, {
      context: 'GET /api/admin/staff'
    });

    // Build query using the pre-joined view
    let query = supabase
      .from('staff_accounts_with_details')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (company !== 'all') {
      // Filter by company using array contains operator
      query = query.contains('assigned_companies', [company]);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    logger.dbQuery('SELECT', 'staff_accounts_with_details', `Fetching staff list (page ${page})`);
    const { data, error, count } = await query;

    if (error) {
      logger.dbError('SELECT', 'staff_accounts_with_details', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'staff_accounts_with_details');

    // Transform data from flat view structure to nested StaffMember type
    const staff: StaffMember[] = (data || []).map((staffMember: any) => ({
      id: staffMember.id,
      email: staffMember.email,
      role: staffMember.role,
      status: staffMember.status,
      created_at: staffMember.created_at,
      updated_at: staffMember.updated_at,
      created_by: staffMember.created_by,
      approved_by: staffMember.approved_by,
      approved_at: staffMember.approved_at,
      last_login_at: staffMember.last_login_at,
      profile: {
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        phone: staffMember.phone,
        profile_photo_url: staffMember.profile_photo_url,
      },
      staff_details: {
        employee_id: staffMember.employee_id,
        position: staffMember.position,
        assigned_companies: staffMember.assigned_companies || [],
      },
      creator: staffMember.creator_first_name && staffMember.creator_last_name ? {
        first_name: staffMember.creator_first_name,
        last_name: staffMember.creator_last_name,
      } : null,
    }));

    const response: PaginatedResponse<StaffMember> = {
      data: staff,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    logger.success(`Fetched ${staff.length} staff members (total: ${count})`, {
      context: 'GET /api/admin/staff'
    });
    logger.separator();

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/admin/staff' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/staff
 * Create a new staff account
 */
export async function POST(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'POST /api/admin/staff' });

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'POST /api/admin/staff' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'POST /api/admin/staff',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      logger.warn('Insufficient permissions - Admin role required', {
        context: 'POST /api/admin/staff',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden: Only administrators can create staff accounts' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'POST /api/admin/staff', userId: user.id });

    // Parse and validate request body
    const body: CreateStaffInput = await request.json();
    logger.debug(`Creating staff account for: ${body.email}`, { context: 'POST /api/admin/staff' });

    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, password'
      }, { status: 400 });
    }

    // Validate email format
    const email = sanitizeInput(body.email.toLowerCase());
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password
    if (body.password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Validate assigned companies is an array
    if (!Array.isArray(body.assignedCompanies)) {
      return NextResponse.json({ success: false, error: 'assignedCompanies must be an array' }, { status: 400 });
    }

    // Check if email already exists
    logger.dbQuery('SELECT', 'accounts', `Checking if email exists: ${email}`);
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAccount) {
      logger.warn('Account creation failed - Email already exists', {
        context: 'POST /api/admin/staff',
        email
      });
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }
    logger.dbSuccess('SELECT', 'accounts');

    // Create Supabase Auth user (using admin client to bypass email confirmation)
    logger.info(`Creating Auth user for: ${email}`, { context: 'POST /api/admin/staff' });
    const { data: authData, error: authUserError } = await adminClient.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: sanitizeInput(body.firstName),
        last_name: sanitizeInput(body.lastName),
        role: 'staff',
      },
    });

    if (authUserError || !authData.user) {
      logger.error('Auth user creation failed', authUserError, {
        context: 'POST /api/admin/staff',
        email
      });
      return NextResponse.json({ success: false, error: 'Failed to create authentication account' }, { status: 500 });
    }
    logger.success(`Auth user created - ID: ${authData.user.id}`, { context: 'POST /api/admin/staff', email });

    // Create database records using our function
    logger.dbQuery('FUNCTION', 'create_staff_account_with_details', `Creating staff account for ${body.firstName} ${body.lastName}`);
    const { data: accountId, error: dbError } = await supabase.rpc('create_staff_account_with_details', {
      p_auth_user_id: authData.user.id,
      p_email: email,
      p_first_name: sanitizeInput(body.firstName),
      p_last_name: sanitizeInput(body.lastName),
      p_phone: body.phone ? sanitizeInput(body.phone) : null,
      p_employee_id: body.employeeId ? sanitizeInput(body.employeeId) : null,
      p_position: body.position ? sanitizeInput(body.position) : null,
      p_assigned_companies: body.assignedCompanies,
      p_created_by: user.id,
      p_status: body.status || 'active',
    });

    if (dbError) {
      logger.dbError('FUNCTION', 'create_staff_account_with_details', dbError);
      logger.warn('Rolling back - Deleting Auth user', {
        context: 'POST /api/admin/staff',
        authUserId: authData.user.id
      });

      // Rollback: Delete the auth user if database creation failed
      await adminClient.auth.admin.deleteUser(authData.user.id);
      logger.info('Auth user deleted successfully (rollback)', { context: 'POST /api/admin/staff' });

      return NextResponse.json({ success: false, error: 'Failed to create staff account' }, { status: 500 });
    }
    logger.dbSuccess('FUNCTION', 'create_staff_account_with_details');

    // Fetch the created staff member with profile and staff_details
    logger.dbQuery('SELECT', 'accounts', 'Fetching created staff member with details');
    const { data: newStaff } = await supabase
      .from('accounts')
      .select(`
        *,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url),
        staff_details:staff_details!inner(employee_id, position, assigned_companies)
      `)
      .eq('id', authData.user.id)
      .single();

    if (!newStaff) {
      logger.error('Failed to fetch created staff member', null, { context: 'POST /api/admin/staff', authUserId: authData.user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch created staff member' }, { status: 500 });
    }
    logger.dbSuccess('SELECT', 'accounts');

    const staffMember: StaffMember = {
      id: newStaff.id,
      email: newStaff.email,
      role: newStaff.role,
      status: newStaff.status,
      created_at: newStaff.created_at,
      updated_at: newStaff.updated_at,
      created_by: newStaff.created_by,
      approved_by: newStaff.approved_by,
      approved_at: newStaff.approved_at,
      last_login_at: newStaff.last_login_at,
      profile: {
        first_name: newStaff.profile.first_name,
        last_name: newStaff.profile.last_name,
        phone: newStaff.profile.phone,
        profile_photo_url: newStaff.profile.profile_photo_url,
      },
      staff_details: {
        employee_id: newStaff.staff_details.employee_id,
        position: newStaff.staff_details.position,
        assigned_companies: newStaff.staff_details.assigned_companies || [],
      },
    };

    logger.success(`Staff account created successfully - ${body.firstName} ${body.lastName} (${email})`, {
      context: 'POST /api/admin/staff',
      staffId: newStaff.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: {
        staff: staffMember,
      },
      message: 'Staff account created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'POST /api/admin/staff' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
