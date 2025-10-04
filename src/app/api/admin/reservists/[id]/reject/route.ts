import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/admin/reservists/[id]/reject
 * Reject a pending reservist account
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: 'PUT /api/admin/reservists/[id]/reject' });

  try {
    const supabase = await createClient();
    const reservistId = params.id;

    // Parse request body for optional rejection reason
    const body = await request.json();
    const rejectionReason = body.reason || 'Account rejected by administrator';

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'PUT /api/admin/reservists/[id]/reject' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'PUT /api/admin/reservists/[id]/reject',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is admin or super_admin
    const { data: accountData } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!accountData || !['admin', 'super_admin'].includes(accountData.role)) {
      logger.warn('Insufficient permissions - Admin or Super Admin role required', {
        context: 'PUT /api/admin/reservists/[id]/reject',
        userId: user.id,
        role: accountData?.role
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can reject reservist accounts'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'PUT /api/admin/reservists/[id]/reject', userId: user.id });

    // Verify the account exists and is a reservist
    logger.dbQuery('SELECT', 'accounts', `Checking reservist account: ${reservistId}`);
    const { data: reservistAccount } = await supabase
      .from('accounts')
      .select('id, email, role, status')
      .eq('id', reservistId)
      .single();

    if (!reservistAccount) {
      logger.warn('Reservist account not found', {
        context: 'PUT /api/admin/reservists/[id]/reject',
        reservistId
      });
      return NextResponse.json({
        success: false,
        error: 'Reservist account not found'
      }, { status: 404 });
    }

    if (reservistAccount.role !== 'reservist') {
      logger.warn('Account is not a reservist', {
        context: 'PUT /api/admin/reservists/[id]/reject',
        reservistId,
        role: reservistAccount.role
      });
      return NextResponse.json({
        success: false,
        error: 'This account is not a reservist account'
      }, { status: 400 });
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Update account status to deactivated
    logger.dbQuery('UPDATE', 'accounts', `Rejecting account: ${reservistAccount.email}`);
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        status: 'deactivated',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservistId);

    if (updateError) {
      logger.dbError('UPDATE', 'accounts', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to reject account'
      }, { status: 500 });
    }

    logger.dbSuccess('UPDATE', 'accounts');

    // Create notification for the reservist
    logger.dbQuery('INSERT', 'notifications', 'Creating rejection notification');
    await supabase
      .from('notifications')
      .insert({
        user_id: reservistId,
        title: 'Account Rejected',
        message: `Your account registration has been rejected. Reason: ${rejectionReason}`,
        type: 'account'
      });
    logger.dbSuccess('INSERT', 'notifications');

    // Create audit log
    logger.dbQuery('FUNCTION', 'create_audit_log', 'Creating audit log for rejection');
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action: 'reject',
      p_entity_type: 'accounts',
      p_entity_id: reservistId,
      p_old_values: { status: reservistAccount.status },
      p_new_values: { status: 'deactivated', rejection_reason: rejectionReason }
    });
    logger.dbSuccess('FUNCTION', 'create_audit_log');

    // Fetch the updated account
    logger.dbQuery('SELECT', 'reservist_accounts_with_details', 'Fetching updated reservist details');
    const { data: updatedReservist } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', reservistId)
      .single();

    logger.dbSuccess('SELECT', 'reservist_accounts_with_details');

    logger.success(`Reservist account rejected successfully: ${reservistAccount.email}`, {
      context: 'PUT /api/admin/reservists/[id]/reject',
      reservistId,
      rejectedBy: user.id,
      reason: rejectionReason
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      message: 'Reservist account rejected successfully',
      data: updatedReservist
    }, { status: 200 });

  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'PUT /api/admin/reservists/[id]/reject' });
    logger.separator();
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
