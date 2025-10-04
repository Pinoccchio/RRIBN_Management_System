import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/reservists/[id]/change-status
 *
 * Change a reservist's account status (active ↔ inactive)
 *
 * Body: { status: 'active' | 'inactive', reason: string }
 *
 * Security:
 * - Staff can only toggle between active and inactive
 * - Cannot set to pending or deactivated (admin only)
 * - Can only modify reservists in assigned companies
 * - All changes are logged to account_status_history
 *
 * Returns: Updated reservist data
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to change account status', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to change account status', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch staff details' }, { status: 500 });
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    // Parse request body
    const body = await request.json();
    const { status: newStatus, reason } = body;

    // Validate input
    if (!newStatus || !reason) {
      return NextResponse.json(
        { success: false, error: 'Status and reason are required' },
        { status: 400 }
      );
    }

    // Validate status value - staff can only set active or inactive
    if (newStatus !== 'active' && newStatus !== 'inactive') {
      logger.warn('Staff attempted to set invalid status', {
        userId: user.id,
        attemptedStatus: newStatus,
      });
      return NextResponse.json(
        { success: false, error: 'Staff can only set status to active or inactive' },
        { status: 400 }
      );
    }

    if (!reason.trim()) {
      return NextResponse.json({ success: false, error: 'Reason cannot be empty' }, { status: 400 });
    }

    // Fetch reservist details
    const { data: reservist, error: reservistError } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', params.id)
      .single();

    if (reservistError || !reservist) {
      logger.error('Failed to fetch reservist', reservistError, { reservistId: params.id });
      return NextResponse.json({ success: false, error: 'Reservist not found' }, { status: 404 });
    }

    // Verify reservist is in assigned companies
    if (reservist.company && !assignedCompanies.includes(reservist.company)) {
      logger.warn('Staff attempted to change status of reservist from unassigned company', {
        userId: user.id,
        reservistCompany: reservist.company,
        assignedCompanies,
      });
      return NextResponse.json(
        { success: false, error: 'Access denied - Reservist not in your assigned companies' },
        { status: 403 }
      );
    }

    // Check if status is already the same
    if (reservist.status === newStatus) {
      return NextResponse.json(
        { success: false, error: `Account is already ${newStatus}` },
        { status: 400 }
      );
    }

    // Prevent changing pending or deactivated accounts (admin only)
    if (reservist.status === 'pending' || reservist.status === 'deactivated') {
      logger.warn('Staff attempted to change status of pending/deactivated account', {
        userId: user.id,
        reservistId: params.id,
        currentStatus: reservist.status,
      });
      return NextResponse.json(
        { success: false, error: `Cannot modify ${reservist.status} accounts. Contact an administrator.` },
        { status: 403 }
      );
    }

    logger.info('Changing account status', {
      userId: user.id,
      reservistId: params.id,
      oldStatus: reservist.status,
      newStatus,
      reason,
    });

    // Update account status
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      logger.error('Failed to update account status', updateError, {
        userId: user.id,
        reservistId: params.id,
      });
      return NextResponse.json({ success: false, error: 'Failed to update account status' }, { status: 500 });
    }

    // Log status change to account_status_history (if table exists)
    try {
      await supabase.from('account_status_history').insert({
        account_id: params.id,
        from_status: reservist.status,
        to_status: newStatus,
        changed_by: user.id,
        reason: reason.trim(),
        action_type: 'manual_update',
        changed_at: new Date().toISOString(),
      });
    } catch (historyError) {
      // Log but don't fail the request if history logging fails
      logger.warn('Failed to log status change to history', historyError);
    }

    // Create notification for the reservist
    try {
      const notificationMessage =
        newStatus === 'active'
          ? 'Your account has been reactivated. You can now log in to the system.'
          : 'Your account has been temporarily deactivated. Please contact your administrator if you have questions.';

      await supabase.from('notifications').insert({
        user_id: params.id,
        title: `Account Status Changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: notificationMessage,
        type: 'system',
        created_at: new Date().toISOString(),
      });
    } catch (notifError) {
      // Log but don't fail the request if notification fails
      logger.warn('Failed to create notification', notifError);
    }

    // Fetch updated reservist data
    const { data: updatedReservist, error: fetchError } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch updated reservist', fetchError);
      // Still return success since the update succeeded
      return NextResponse.json({
        success: true,
        message: 'Account status updated successfully',
        data: { id: params.id, status: newStatus },
      });
    }

    logger.success('Account status changed successfully', {
      userId: user.id,
      reservistId: params.id,
      newStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Account status updated successfully',
      data: updatedReservist,
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/staff/reservists/[id]/change-status', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
