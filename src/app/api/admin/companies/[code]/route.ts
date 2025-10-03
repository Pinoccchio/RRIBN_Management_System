import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/utils/validation';
import { logger } from '@/lib/logger';
import type { Company, UpdateCompanyInput } from '@/lib/types/staff';

/**
 * PATCH /api/admin/companies/[code]
 * Update an existing company
 * Restricted to admin and super_admin (RLS policy: admin_and_super_admin_manage_companies)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  logger.separator();
  logger.info('API Request', { context: 'PATCH /api/admin/companies/[code]' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'PATCH /api/admin/companies/[code]' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'PATCH /api/admin/companies/[code]',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      logger.warn('Insufficient permissions - Admin role required', {
        context: 'PATCH /api/admin/companies/[code]',
        userId: user.id
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can update companies'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'PATCH /api/admin/companies/[code]', userId: user.id });

    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();

    logger.debug(`Updating company: ${code}`, { context: 'PATCH /api/admin/companies/[code]' });

    // Get existing company for audit log
    logger.dbQuery('SELECT', 'companies', `Fetching company: ${code}`);
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !existingCompany) {
      logger.dbError('SELECT', 'companies', fetchError);
      logger.warn('Company not found', { context: 'PATCH /api/admin/companies/[code]', code });
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    logger.dbSuccess('SELECT', 'companies');

    // Parse and validate request body
    const body: any = await request.json();

    // Build update object (only include fields that are provided)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      updateData.name = sanitizeInput(body.name);
    }

    if (body.description !== undefined) {
      updateData.description = body.description ? sanitizeInput(body.description) : null;
    }

    // Support reactivation/deactivation
    if (body.is_active !== undefined) {
      if (typeof body.is_active !== 'boolean') {
        logger.warn('Invalid is_active type', { context: 'PATCH /api/admin/companies/[code]', code });
        return NextResponse.json({
          success: false,
          error: 'is_active must be a boolean'
        }, { status: 400 });
      }
      updateData.is_active = body.is_active;
    }

    // Validate at least one field is being updated
    if (Object.keys(updateData).length === 1) { // Only updated_at
      logger.warn('No fields to update', { context: 'PATCH /api/admin/companies/[code]', code });
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    // Update company
    logger.dbQuery('UPDATE', 'companies', `Updating company: ${code}`);
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      logger.dbError('UPDATE', 'companies', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update company'
      }, { status: 500 });
    }
    logger.dbSuccess('UPDATE', 'companies');

    // Create audit log
    logger.dbQuery('FUNCTION', 'create_audit_log', 'Creating audit log for company update');
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'update',
      p_entity_type: 'companies',
      p_entity_id: existingCompany.id,
      p_old_values: {
        name: existingCompany.name,
        description: existingCompany.description,
        is_active: existingCompany.is_active,
      },
      p_new_values: {
        name: updateData.name,
        description: updateData.description,
        is_active: updateData.is_active,
      },
    });
    logger.dbSuccess('FUNCTION', 'create_audit_log');

    logger.success(`Company updated successfully: ${code}`, {
      context: 'PATCH /api/admin/companies/[code]',
      companyId: existingCompany.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: data as Company,
      message: 'Company updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'PATCH /api/admin/companies/[code]' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/companies/[code]
 * Soft delete a company (set is_active = false)
 * Restricted to admin and super_admin (RLS policy: admin_and_super_admin_manage_companies)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  logger.separator();
  logger.info('API Request', { context: 'DELETE /api/admin/companies/[code]' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'DELETE /api/admin/companies/[code]' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'DELETE /api/admin/companies/[code]',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      logger.warn('Insufficient permissions - Admin role required', {
        context: 'DELETE /api/admin/companies/[code]',
        userId: user.id
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can delete companies'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'DELETE /api/admin/companies/[code]', userId: user.id });

    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();

    logger.debug(`Deactivating company: ${code}`, { context: 'DELETE /api/admin/companies/[code]' });

    // Get existing company
    logger.dbQuery('SELECT', 'companies', `Fetching company: ${code}`);
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !existingCompany) {
      logger.dbError('SELECT', 'companies', fetchError);
      logger.warn('Company not found', { context: 'DELETE /api/admin/companies/[code]', code });
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    logger.dbSuccess('SELECT', 'companies');

    // Check if company is already inactive
    if (!existingCompany.is_active) {
      logger.warn('Company already deactivated', { context: 'DELETE /api/admin/companies/[code]', code });
      return NextResponse.json({
        success: false,
        error: 'Company is already deactivated'
      }, { status: 400 });
    }

    // Check if company has assigned staff members
    logger.dbQuery('SELECT', 'staff_details', `Checking staff assignments for company: ${code}`);
    const { count: staffCount } = await supabase
      .from('staff_details')
      .select('*', { count: 'exact', head: true })
      .contains('assigned_companies', [code]);
    logger.dbSuccess('SELECT', 'staff_details');

    // Check if company has assigned reservists
    logger.dbQuery('SELECT', 'reservist_details', `Checking reservist assignments for company: ${code}`);
    const { count: reservistCount } = await supabase
      .from('reservist_details')
      .select('*', { count: 'exact', head: true })
      .eq('company', code);
    logger.dbSuccess('SELECT', 'reservist_details');

    // Warn if there are dependencies but allow soft delete
    const totalDependencies = (staffCount || 0) + (reservistCount || 0);
    if (totalDependencies > 0) {
      logger.info(`Company has ${totalDependencies} assignments (${staffCount} staff, ${reservistCount} reservists)`, {
        context: 'DELETE /api/admin/companies/[code]',
        code
      });
    }

    // Soft delete (set is_active = false)
    logger.dbQuery('UPDATE', 'companies', `Deactivating company: ${code}`);
    const { data, error } = await supabase
      .from('companies')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('code', code)
      .select()
      .single();

    if (error) {
      logger.dbError('UPDATE', 'companies', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to deactivate company'
      }, { status: 500 });
    }
    logger.dbSuccess('UPDATE', 'companies');

    // Create audit log
    logger.dbQuery('FUNCTION', 'create_audit_log', 'Creating audit log for company deactivation');
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'update',
      p_entity_type: 'companies',
      p_entity_id: existingCompany.id,
      p_old_values: { is_active: true },
      p_new_values: { is_active: false },
    });
    logger.dbSuccess('FUNCTION', 'create_audit_log');

    const message = `Company deactivated successfully${totalDependencies > 0 ? ` (${totalDependencies} assignments remain)` : ''}`;
    logger.success(message, {
      context: 'DELETE /api/admin/companies/[code]',
      code,
      companyId: existingCompany.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: data as Company,
      message,
    });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'DELETE /api/admin/companies/[code]' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
