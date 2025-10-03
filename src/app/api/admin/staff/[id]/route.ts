import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidUUID, sanitizeInput } from '@/lib/utils/validation';
import type { StaffMember, UpdateStaffInput } from '@/lib/types/staff';

/**
 * GET /api/admin/staff/[id]
 * Get a single staff member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'Invalid staff ID format' }, { status: 400 });
    }

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch staff member using the pre-joined view
    const { data, error } = await supabase
      .from('staff_accounts_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    // Transform flat view structure to nested StaffMember type
    const staffMember: StaffMember = {
      id: data.id,
      email: data.email,
      role: data.role,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      approved_by: data.approved_by,
      approved_at: data.approved_at,
      last_login_at: data.last_login_at,
      profile: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        profile_photo_url: data.profile_photo_url,
      },
      staff_details: {
        employee_id: data.employee_id,
        position: data.position,
        assigned_companies: data.assigned_companies || [],
      },
      creator: data.creator_first_name && data.creator_last_name ? {
        first_name: data.creator_first_name,
        last_name: data.creator_last_name,
      } : null,
    };

    return NextResponse.json({ success: true, data: staffMember });
  } catch (error) {
    console.error('Error in GET /api/admin/staff/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/staff/[id]
 * Update a staff member
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'Invalid staff ID format' }, { status: 400 });
    }

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body: UpdateStaffInput = await request.json();

    // Validate at least one field is provided
    if (!body.firstName && !body.lastName && !body.phone && !body.employeeId && !body.position && !body.assignedCompanies && !body.status) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // Validate assigned companies is an array if provided
    if (body.assignedCompanies !== undefined && !Array.isArray(body.assignedCompanies)) {
      return NextResponse.json({ success: false, error: 'assignedCompanies must be an array' }, { status: 400 });
    }

    // Update staff member using database function
    const { error: updateError } = await supabase.rpc('update_staff_account', {
      p_account_id: id,
      p_first_name: body.firstName ? sanitizeInput(body.firstName) : null,
      p_last_name: body.lastName ? sanitizeInput(body.lastName) : null,
      p_phone: body.phone ? sanitizeInput(body.phone) : null,
      p_employee_id: body.employeeId ? sanitizeInput(body.employeeId) : null,
      p_position: body.position ? sanitizeInput(body.position) : null,
      p_assigned_companies: body.assignedCompanies || null,
      p_status: body.status || null,
    });

    if (updateError) {
      console.error('Error updating staff member:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update staff member' }, { status: 500 });
    }

    // Fetch updated staff member
    const { data: updatedStaff } = await supabase
      .from('accounts')
      .select(`
        *,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url),
        staff_details:staff_details!inner(employee_id, position, assigned_companies)
      `)
      .eq('id', id)
      .single();

    if (!updatedStaff) {
      return NextResponse.json({ success: false, error: 'Failed to fetch updated staff member' }, { status: 500 });
    }

    const staffMember: StaffMember = {
      id: updatedStaff.id,
      email: updatedStaff.email,
      role: updatedStaff.role,
      status: updatedStaff.status,
      created_at: updatedStaff.created_at,
      updated_at: updatedStaff.updated_at,
      created_by: updatedStaff.created_by,
      approved_by: updatedStaff.approved_by,
      approved_at: updatedStaff.approved_at,
      last_login_at: updatedStaff.last_login_at,
      profile: {
        first_name: updatedStaff.profile.first_name,
        last_name: updatedStaff.profile.last_name,
        phone: updatedStaff.profile.phone,
        profile_photo_url: updatedStaff.profile.profile_photo_url,
      },
      staff_details: {
        employee_id: updatedStaff.staff_details.employee_id,
        position: updatedStaff.staff_details.position,
        assigned_companies: updatedStaff.staff_details.assigned_companies || [],
      },
    };

    return NextResponse.json({
      success: true,
      data: staffMember,
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/staff/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/staff/[id]
 * Permanently delete a staff member (hard delete from Auth and Database)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ success: false, error: 'Invalid staff ID format' }, { status: 400 });
    }

    // Check if user is authenticated and is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_uuid: user.id });
    if (!isSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Step 1: Get staff details for logging (optional - before deletion)
    const { data: staff } = await supabase
      .from('staff_accounts_with_details')
      .select('email, first_name, last_name')
      .eq('id', id)
      .single();

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 });
    }

    // Step 2: Delete from Supabase Auth using service role key
    const adminClient = createAdminClient();
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('Error deleting staff from Auth:', authDeleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete staff member from authentication system'
      }, { status: 500 });
    }

    // Step 3: Delete from database (CASCADE will handle profiles and staff_details)
    const { error: dbDeleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (dbDeleteError) {
      console.error('Error deleting staff from database:', dbDeleteError);
      // Note: Auth user is already deleted at this point
      return NextResponse.json({
        success: false,
        error: 'Failed to delete staff member from database'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/staff/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
