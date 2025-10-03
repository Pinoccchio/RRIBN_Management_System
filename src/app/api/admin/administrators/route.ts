import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidEmail, sanitizeInput } from '@/lib/utils/validation';
import { logger } from '@/lib/logger';
import type { CreateAdministratorInput, Administrator, PaginatedResponse, AdministratorFilters } from '@/lib/types/administrator';

/**
 * GET /api/admin/administrators
 * List all administrators with filtering and pagination
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/administrators' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/admin/administrators' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/admin/administrators',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      logger.warn('Insufficient permissions - Super Admin role required', {
        context: 'GET /api/admin/administrators',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden: Only super administrators can access this resource' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/admin/administrators', userId: user.id });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    logger.debug(`Filters: role=${role}, status=${status}, search=${search}, page=${page}`, {
      context: 'GET /api/admin/administrators'
    });

    // Build query using the pre-joined view
    let query = supabase
      .from('admin_accounts_with_details')
      .select('*', { count: 'exact' });

    // Apply filters
    if (role !== 'all') {
      query = query.eq('role', role);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    logger.dbQuery('SELECT', 'admin_accounts_with_details', `Fetching administrators list (page ${page})`);
    const { data, error, count } = await query;

    if (error) {
      logger.dbError('SELECT', 'admin_accounts_with_details', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch administrators' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'admin_accounts_with_details');

    // Transform data from flat view structure to nested Administrator type
    const administrators: Administrator[] = (data || []).map((admin: any) => ({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
      created_by: admin.created_by,
      approved_by: admin.approved_by,
      approved_at: admin.approved_at,
      last_login_at: admin.last_login_at,
      profile: {
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone: admin.phone,
        profile_photo_url: admin.profile_photo_url,
      },
      creator: admin.creator_first_name && admin.creator_last_name ? {
        first_name: admin.creator_first_name,
        last_name: admin.creator_last_name,
      } : null,
    }));

    const response: PaginatedResponse<Administrator> = {
      data: administrators,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    logger.success(`Fetched ${administrators.length} administrators (total: ${count})`, {
      context: 'GET /api/admin/administrators'
    });
    logger.separator();

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/admin/administrators' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/administrators
 * Create a new administrator account
 */
export async function POST(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'POST /api/admin/administrators' });

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'POST /api/admin/administrators' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'POST /api/admin/administrators',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      logger.warn('Insufficient permissions - Super Admin role required', {
        context: 'POST /api/admin/administrators',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden: Only super administrators can create admin accounts' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'POST /api/admin/administrators', userId: user.id });

    // Parse and validate request body
    const body: CreateAdministratorInput = await request.json();
    logger.debug(`Creating administrator account for: ${body.email}`, { context: 'POST /api/admin/administrators' });

    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.role || !body.password) {
      logger.warn('Missing required fields', { context: 'POST /api/admin/administrators' });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, role, password'
      }, { status: 400 });
    }

    // Validate email format
    const email = sanitizeInput(body.email.toLowerCase());
    if (!isValidEmail(email)) {
      logger.warn('Invalid email format', { context: 'POST /api/admin/administrators', email });
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(body.role)) {
      logger.warn('Invalid role', { context: 'POST /api/admin/administrators', role: body.role });
      return NextResponse.json({ success: false, error: 'Invalid role. Must be admin or super_admin' }, { status: 400 });
    }

    // Validate password
    if (body.password.length < 8) {
      logger.warn('Password too short', { context: 'POST /api/admin/administrators' });
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
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
        context: 'POST /api/admin/administrators',
        email
      });
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }
    logger.dbSuccess('SELECT', 'accounts');

    // Create Supabase Auth user (using admin client to bypass email confirmation)
    logger.info(`Creating Auth user for: ${email}`, { context: 'POST /api/admin/administrators' });
    const { data: authData, error: authUserError } = await adminClient.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: sanitizeInput(body.firstName),
        last_name: sanitizeInput(body.lastName),
        role: body.role,
      },
    });

    if (authUserError || !authData.user) {
      logger.error('Auth user creation failed', authUserError, {
        context: 'POST /api/admin/administrators',
        email
      });
      return NextResponse.json({ success: false, error: 'Failed to create authentication account' }, { status: 500 });
    }
    logger.success(`Auth user created - ID: ${authData.user.id}`, { context: 'POST /api/admin/administrators', email });

    // Create database records using our function
    logger.dbQuery('FUNCTION', 'create_admin_account_with_details', `Creating admin account for ${body.firstName} ${body.lastName}`);
    const { data: accountId, error: dbError } = await supabase.rpc('create_admin_account_with_details', {
      p_auth_user_id: authData.user.id,
      p_email: email,
      p_role: body.role,
      p_first_name: sanitizeInput(body.firstName),
      p_last_name: sanitizeInput(body.lastName),
      p_phone: body.phone ? sanitizeInput(body.phone) : null,
      p_created_by: user.id,
      p_status: body.status || 'active',
    });

    if (dbError) {
      logger.dbError('FUNCTION', 'create_admin_account_with_details', dbError);
      logger.warn('Rolling back - Deleting Auth user', {
        context: 'POST /api/admin/administrators',
        authUserId: authData.user.id
      });

      // Rollback: Delete the auth user if database creation failed
      await adminClient.auth.admin.deleteUser(authData.user.id);
      logger.info('Auth user deleted successfully (rollback)', { context: 'POST /api/admin/administrators' });

      return NextResponse.json({ success: false, error: 'Failed to create administrator account' }, { status: 500 });
    }
    logger.dbSuccess('FUNCTION', 'create_admin_account_with_details');

    // Fetch the created administrator with profile
    logger.dbQuery('SELECT', 'accounts', 'Fetching created administrator with details');
    const { data: newAdmin } = await supabase
      .from('accounts')
      .select(`
        *,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url)
      `)
      .eq('id', authData.user.id)
      .single();

    if (!newAdmin) {
      logger.error('Failed to fetch created administrator', null, { context: 'POST /api/admin/administrators', authUserId: authData.user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch created administrator' }, { status: 500 });
    }
    logger.dbSuccess('SELECT', 'accounts');

    const administrator: Administrator = {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      status: newAdmin.status,
      created_at: newAdmin.created_at,
      updated_at: newAdmin.updated_at,
      created_by: newAdmin.created_by,
      approved_by: newAdmin.approved_by,
      approved_at: newAdmin.approved_at,
      last_login_at: newAdmin.last_login_at,
      profile: {
        first_name: newAdmin.profile.first_name,
        last_name: newAdmin.profile.last_name,
        phone: newAdmin.profile.phone,
        profile_photo_url: newAdmin.profile.profile_photo_url,
      },
    };

    logger.success(`Administrator account created successfully: ${body.firstName} ${body.lastName} (${email}) - Role: ${body.role}`, {
      context: 'POST /api/admin/administrators',
      adminId: newAdmin.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: {
        administrator,
      },
      message: 'Administrator account created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'POST /api/admin/administrators' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
