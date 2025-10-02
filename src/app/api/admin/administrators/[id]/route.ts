import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidUUID, sanitizeInput } from '@/lib/utils/validation';
import type { Administrator, UpdateAdministratorInput } from '@/lib/types/administrator';

/**
 * GET /api/admin/administrators/[id]
 * Get a single administrator by ID
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
      return NextResponse.json({ success: false, error: 'Invalid administrator ID format' }, { status: 400 });
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

    // Fetch administrator using the pre-joined view
    const { data, error } = await supabase
      .from('admin_accounts_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Administrator not found' }, { status: 404 });
    }

    // Transform flat view structure to nested Administrator type
    const administrator: Administrator = {
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
      creator: data.creator_first_name && data.creator_last_name ? {
        first_name: data.creator_first_name,
        last_name: data.creator_last_name,
      } : null,
    };

    return NextResponse.json({ success: true, data: administrator });
  } catch (error) {
    console.error('Error in GET /api/admin/administrators/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/administrators/[id]
 * Update an administrator
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
      return NextResponse.json({ success: false, error: 'Invalid administrator ID format' }, { status: 400 });
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
    const body: UpdateAdministratorInput = await request.json();

    // Validate at least one field is provided
    if (!body.firstName && !body.lastName && !body.phone && !body.role && !body.status) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // Validate role if provided
    if (body.role && !['admin', 'super_admin'].includes(body.role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // Update administrator using database function
    const { error: updateError } = await supabase.rpc('update_admin_account', {
      p_account_id: id,
      p_first_name: body.firstName ? sanitizeInput(body.firstName) : null,
      p_last_name: body.lastName ? sanitizeInput(body.lastName) : null,
      p_phone: body.phone ? sanitizeInput(body.phone) : null,
      p_role: body.role || null,
      p_status: body.status || null,
      p_updated_by: user.id,
    });

    if (updateError) {
      console.error('Error updating administrator:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update administrator' }, { status: 500 });
    }

    // Fetch updated administrator
    const { data: updatedAdmin } = await supabase
      .from('accounts')
      .select(`
        *,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url)
      `)
      .eq('id', id)
      .single();

    if (!updatedAdmin) {
      return NextResponse.json({ success: false, error: 'Failed to fetch updated administrator' }, { status: 500 });
    }

    const administrator: Administrator = {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      status: updatedAdmin.status,
      created_at: updatedAdmin.created_at,
      updated_at: updatedAdmin.updated_at,
      created_by: updatedAdmin.created_by,
      approved_by: updatedAdmin.approved_by,
      approved_at: updatedAdmin.approved_at,
      last_login_at: updatedAdmin.last_login_at,
      profile: {
        first_name: updatedAdmin.profile.first_name,
        last_name: updatedAdmin.profile.last_name,
        phone: updatedAdmin.profile.phone,
        profile_photo_url: updatedAdmin.profile.profile_photo_url,
      },
    };

    return NextResponse.json({
      success: true,
      data: administrator,
      message: 'Administrator updated successfully'
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/administrators/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/administrators/[id]
 * Permanently delete an administrator (hard delete from Auth and Database)
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
      return NextResponse.json({ success: false, error: 'Invalid administrator ID format' }, { status: 400 });
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

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Step 1: Get administrator details for logging (optional - before deletion)
    const { data: admin } = await supabase
      .from('admin_accounts_with_details')
      .select('email, profile:profiles(first_name, last_name)')
      .eq('id', id)
      .single();

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Administrator not found' }, { status: 404 });
    }

    // Step 2: Delete from Supabase Auth using service role key
    const adminClient = createAdminClient();
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('Error deleting administrator from Auth:', authDeleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete administrator from authentication system'
      }, { status: 500 });
    }

    // Step 3: Delete from database (CASCADE will handle profiles and staff_details)
    const { error: dbDeleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (dbDeleteError) {
      console.error('Error deleting administrator from database:', dbDeleteError);
      // Note: Auth user is already deleted at this point
      return NextResponse.json({
        success: false,
        error: 'Failed to delete administrator from database'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/administrators/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
