import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/utils/validation';
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
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can update companies'
      }, { status: 403 });
    }

    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();

    // Get existing company for audit log
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

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
        return NextResponse.json({
          success: false,
          error: 'is_active must be a boolean'
        }, { status: 400 });
      }
      updateData.is_active = body.is_active;
    }

    // Validate at least one field is being updated
    if (Object.keys(updateData).length === 1) { // Only updated_at
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    // Update company
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update company'
      }, { status: 500 });
    }

    // Create audit log
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

    return NextResponse.json({
      success: true,
      data: data as Company,
      message: 'Company updated successfully',
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/companies/[code]:', error);
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
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin or super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above', { user_uuid: user.id });
    if (!isAdminOrAbove) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can delete companies'
      }, { status: 403 });
    }

    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();

    // Get existing company
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

    // Check if company is already inactive
    if (!existingCompany.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Company is already deactivated'
      }, { status: 400 });
    }

    // Check if company has assigned staff members
    const { count: staffCount } = await supabase
      .from('staff_details')
      .select('*', { count: 'exact', head: true })
      .contains('assigned_companies', [code]);

    // Check if company has assigned reservists
    const { count: reservistCount } = await supabase
      .from('reservist_details')
      .select('*', { count: 'exact', head: true })
      .eq('company', code);

    // Warn if there are dependencies but allow soft delete
    const totalDependencies = (staffCount || 0) + (reservistCount || 0);

    // Soft delete (set is_active = false)
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
      console.error('Error deactivating company:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to deactivate company'
      }, { status: 500 });
    }

    // Create audit log
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'update',
      p_entity_type: 'companies',
      p_entity_id: existingCompany.id,
      p_old_values: { is_active: true },
      p_new_values: { is_active: false },
    });

    return NextResponse.json({
      success: true,
      data: data as Company,
      message: `Company deactivated successfully${totalDependencies > 0 ? ` (${totalDependencies} assignments remain)` : ''}`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/companies/[code]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
