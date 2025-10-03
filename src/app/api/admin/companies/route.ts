import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/utils/validation';
import type { Company, CreateCompanyInput } from '@/lib/types/staff';

/**
 * GET /api/admin/companies
 * List all companies (or filter by active status)
 * Accessible by all authenticated users (RLS policy: all_view_companies)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    // Build query
    let query = supabase
      .from('companies')
      .select('*')
      .order('code', { ascending: true });

    // Filter by active status if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data as Company[] });
  } catch (error) {
    console.error('Error in GET /api/admin/companies:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/companies
 * Create a new company
 * Restricted to super_admin only (RLS policy: super_admin_modify_companies)
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only super administrators can create companies'
      }, { status: 403 });
    }

    // Parse and validate request body
    const body: CreateCompanyInput = await request.json();

    // Validate required fields
    if (!body.code || !body.name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code, name'
      }, { status: 400 });
    }

    // Sanitize and uppercase code
    const code = sanitizeInput(body.code.toUpperCase());
    const name = sanitizeInput(body.name);
    const description = body.description ? sanitizeInput(body.description) : null;

    // Validate code format (at least 2 characters, uppercase)
    if (code.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Company code must be at least 2 characters'
      }, { status: 400 });
    }

    if (code !== code.toUpperCase()) {
      return NextResponse.json({
        success: false,
        error: 'Company code must be uppercase'
      }, { status: 400 });
    }

    // Check if code already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('code', code)
      .single();

    if (existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'A company with this code already exists'
      }, { status: 409 });
    }

    // Create company
    const { data, error } = await supabase
      .from('companies')
      .insert({
        code,
        name,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create company'
      }, { status: 500 });
    }

    // Create audit log
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'create',
      p_entity_type: 'companies',
      p_entity_id: data.id,
      p_old_values: null,
      p_new_values: { code, name, description },
    });

    return NextResponse.json({
      success: true,
      data: data as Company,
      message: 'Company created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/companies:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
