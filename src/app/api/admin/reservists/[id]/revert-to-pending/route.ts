import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/admin/reservists/[id]/revert-to-pending
 * Revert an active reservist account back to pending status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: 'PUT /api/admin/reservists/[id]/revert-to-pending' });

  try {
    const supabase = await createClient();
    const reservistId = params.id;

    // Parse request body for revert reason
    const body = await request.json();
    const revertReason = body.reason || 'Account reverted to pending for re-evaluation';

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'PUT /api/admin/reservists/[id]/revert-to-pending' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
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
        context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
        userId: user.id,
        role: accountData?.role
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can revert reservist accounts to pending'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'PUT /api/admin/reservists/[id]/revert-to-pending', userId: user.id });

    // Verify the account exists and is a reservist
    logger.dbQuery('SELECT', 'accounts', `Checking reservist account: ${reservistId}`);
    const { data: reservistAccount } = await supabase
      .from('accounts')
      .select('id, email, role, status')
      .eq('id', reservistId)
      .single();

    if (!reservistAccount) {
      logger.warn('Reservist account not found', {
        context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
        reservistId
      });
      return NextResponse.json({
        success: false,
        error: 'Reservist account not found'
      }, { status: 404 });
    }

    if (reservistAccount.role !== 'reservist') {
      logger.warn('Account is not a reservist', {
        context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
        reservistId,
        role: reservistAccount.role
      });
      return NextResponse.json({
        success: false,
        error: 'This account is not a reservist account'
      }, { status: 400 });
    }

    if (reservistAccount.status !== 'active') {
      logger.warn('Account is not active', {
        context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
        reservistId,
        status: reservistAccount.status
      });
      return NextResponse.json({
        success: false,
        error: 'Only active accounts can be reverted to pending'
      }, { status: 400 });
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Call the revert_to_pending database function
    logger.dbQuery('FUNCTION', 'revert_to_pending', `Reverting account to pending: ${reservistAccount.email}`);
    const { data: revertResult, error: revertError } = await supabase.rpc('revert_to_pending', {
      p_account_id: reservistId,
      p_admin_id: user.id,
      p_reason: revertReason
    });

    if (revertError) {
      logger.dbError('FUNCTION', 'revert_to_pending', revertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to revert account to pending'
      }, { status: 500 });
    }

    logger.dbSuccess('FUNCTION', 'revert_to_pending');

    // Fetch the updated account
    logger.dbQuery('SELECT', 'reservist_accounts_with_details', 'Fetching updated reservist details');
    const { data: updatedReservist } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', reservistId)
      .single();

    logger.dbSuccess('SELECT', 'reservist_accounts_with_details');

    logger.success(`Reservist account reverted to pending successfully: ${reservistAccount.email}`, {
      context: 'PUT /api/admin/reservists/[id]/revert-to-pending',
      reservistId,
      revertedBy: user.id,
      reason: revertReason
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      message: 'Reservist account reverted to pending successfully',
      data: updatedReservist
    }, { status: 200 });

  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'PUT /api/admin/reservists/[id]/revert-to-pending' });
    logger.separator();
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
