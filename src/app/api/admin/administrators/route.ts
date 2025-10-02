import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidEmail, sanitizeInput } from '@/lib/utils/validation';
import type { CreateAdministratorInput, Administrator, PaginatedResponse, AdministratorFilters } from '@/lib/types/administrator';

/**
 * GET /api/admin/administrators
 * List all administrators with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only super administrators can access this resource' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching administrators:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch administrators' }, { status: 500 });
    }

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

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    console.error('Error in GET /api/admin/administrators:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/administrators
 * Create a new administrator account
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only super administrators can create admin accounts' }, { status: 403 });
    }

    // Parse and validate request body
    const body: CreateAdministratorInput = await request.json();

    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.role || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, role, password'
      }, { status: 400 });
    }

    // Validate email format
    const email = sanitizeInput(body.email.toLowerCase());
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(body.role)) {
      return NextResponse.json({ success: false, error: 'Invalid role. Must be admin or super_admin' }, { status: 400 });
    }

    // Validate password
    if (body.password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAccount) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create Supabase Auth user (using admin client to bypass email confirmation)
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
      console.error('Error creating auth user:', authUserError);
      return NextResponse.json({ success: false, error: 'Failed to create authentication account' }, { status: 500 });
    }

    // Create database records using our function
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
      console.error('Error creating database records:', dbError);

      // Rollback: Delete the auth user if database creation failed
      await adminClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json({ success: false, error: 'Failed to create administrator account' }, { status: 500 });
    }

    // Fetch the created administrator with profile
    const { data: newAdmin } = await supabase
      .from('accounts')
      .select(`
        *,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url)
      `)
      .eq('id', authData.user.id)
      .single();

    if (!newAdmin) {
      return NextResponse.json({ success: false, error: 'Failed to fetch created administrator' }, { status: 500 });
    }

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

    return NextResponse.json({
      success: true,
      data: {
        administrator,
      },
      message: 'Administrator account created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/administrators:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
