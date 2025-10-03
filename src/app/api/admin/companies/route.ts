import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/utils/validation';
import { logger } from '@/lib/logger';
import type { Company, CreateCompanyInput } from '@/lib/types/staff';

/**
 * GET /api/admin/companies
 * List all companies (or filter by active status)
 * Accessible by all authenticated users (RLS policy: all_view_companies)
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/companies' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/admin/companies' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/admin/companies',
      userId: user.id,
      email: user.email || undefined
    });

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') === 'true';

    logger.debug(`Filters: activeOnly=${activeOnly}`, { context: 'GET /api/admin/companies' });

    // Build query
    let query = supabase
      .from('companies')
      .select('*')
      .order('code', { ascending: true });

    // Filter by active status if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    logger.dbQuery('SELECT', 'companies', activeOnly ? 'Fetching active companies' : 'Fetching all companies');
    const { data, error } = await query;

    if (error) {
      logger.dbError('SELECT', 'companies', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'companies');
    logger.success(`Fetched ${data.length} companies`, { context: 'GET /api/admin/companies' });
    logger.separator();

    return NextResponse.json({ success: true, data: data as Company[] });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/admin/companies' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/companies
 * Create a new company
 * Restricted to admin and super_admin (RLS policy: admin_and_super_admin_manage_companies)
 */
export async function POST(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'POST /api/admin/companies' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'POST /api/admin/companies' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'POST /api/admin/companies',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      logger.warn('Insufficient permissions - Admin role required', {
        context: 'POST /api/admin/companies',
        userId: user.id
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can create companies'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'POST /api/admin/companies', userId: user.id });

    // Parse and validate request body
    const body: CreateCompanyInput = await request.json();

    // Validate required fields
    if (!body.code || !body.name) {
      logger.warn('Missing required fields', { context: 'POST /api/admin/companies' });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: code, name'
      }, { status: 400 });
    }

    // Sanitize and uppercase code
    const code = sanitizeInput(body.code.toUpperCase());
    const name = sanitizeInput(body.name);
    const description = body.description ? sanitizeInput(body.description) : null;

    logger.debug(`Creating company: ${code} - ${name}`, { context: 'POST /api/admin/companies' });

    // Validate code format (at least 2 characters, uppercase)
    if (code.length < 2) {
      logger.warn('Invalid company code - too short', { context: 'POST /api/admin/companies', code });
      return NextResponse.json({
        success: false,
        error: 'Company code must be at least 2 characters'
      }, { status: 400 });
    }

    if (code !== code.toUpperCase()) {
      logger.warn('Invalid company code - not uppercase', { context: 'POST /api/admin/companies', code });
      return NextResponse.json({
        success: false,
        error: 'Company code must be uppercase'
      }, { status: 400 });
    }

    // Check if code already exists
    logger.dbQuery('SELECT', 'companies', `Checking if company code exists: ${code}`);
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('code', code)
      .single();

    if (existingCompany) {
      logger.warn('Company code already exists', { context: 'POST /api/admin/companies', code });
      return NextResponse.json({
        success: false,
        error: 'A company with this code already exists'
      }, { status: 409 });
    }
    logger.dbSuccess('SELECT', 'companies');

    // Create company
    logger.dbQuery('INSERT', 'companies', `Creating company: ${code} - ${name}`);
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
      logger.dbError('INSERT', 'companies', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create company'
      }, { status: 500 });
    }
    logger.dbSuccess('INSERT', 'companies');

    // Create audit log
    logger.dbQuery('FUNCTION', 'create_audit_log', 'Creating audit log for company creation');
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'create',
      p_entity_type: 'companies',
      p_entity_id: data.id,
      p_old_values: null,
      p_new_values: { code, name, description },
    });
    logger.dbSuccess('FUNCTION', 'create_audit_log');

    logger.success(`Company created successfully: ${code} - ${name}`, {
      context: 'POST /api/admin/companies',
      companyId: data.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: data as Company,
      message: 'Company created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'POST /api/admin/companies' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
