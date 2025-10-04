import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/admin/reservists/[id]/approve
 * Approve a pending reservist account
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: 'PUT /api/admin/reservists/[id]/approve' });

  try {
    const supabase = await createClient();
    const reservistId = params.id;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'PUT /api/admin/reservists/[id]/approve' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'PUT /api/admin/reservists/[id]/approve',
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
        context: 'PUT /api/admin/reservists/[id]/approve',
        userId: user.id,
        role: accountData?.role
      });
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Only administrators can approve reservist accounts'
      }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'PUT /api/admin/reservists/[id]/approve', userId: user.id });

    // Verify the account exists and is a reservist
    logger.dbQuery('SELECT', 'accounts', `Checking reservist account: ${reservistId}`);
    const { data: reservistAccount } = await supabase
      .from('accounts')
      .select('id, email, role, status')
      .eq('id', reservistId)
      .single();

    if (!reservistAccount) {
      logger.warn('Reservist account not found', {
        context: 'PUT /api/admin/reservists/[id]/approve',
        reservistId
      });
      return NextResponse.json({
        success: false,
        error: 'Reservist account not found'
      }, { status: 404 });
    }

    if (reservistAccount.role !== 'reservist') {
      logger.warn('Account is not a reservist', {
        context: 'PUT /api/admin/reservists/[id]/approve',
        reservistId,
        role: reservistAccount.role
      });
      return NextResponse.json({
        success: false,
        error: 'This account is not a reservist account'
      }, { status: 400 });
    }

    if (reservistAccount.status === 'active') {
      logger.warn('Account is already approved', {
        context: 'PUT /api/admin/reservists/[id]/approve',
        reservistId
      });
      return NextResponse.json({
        success: false,
        error: 'This account is already approved'
      }, { status: 400 });
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Call the approve_account database function
    // This function handles: status update, approved_by, approved_at, notification, and audit log
    logger.dbQuery('FUNCTION', 'approve_account', `Approving account: ${reservistAccount.email}`);
    const { data: approveResult, error: approveError } = await supabase.rpc('approve_account', {
      p_account_id: reservistId,
      p_approver_id: user.id
    });

    if (approveError) {
      logger.dbError('FUNCTION', 'approve_account', approveError);
      return NextResponse.json({
        success: false,
        error: 'Failed to approve account'
      }, { status: 500 });
    }

    logger.dbSuccess('FUNCTION', 'approve_account');

    // Fetch the updated account with profile
    logger.dbQuery('SELECT', 'reservist_accounts_with_details', 'Fetching updated reservist details');
    const { data: updatedReservist } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', reservistId)
      .single();

    logger.dbSuccess('SELECT', 'reservist_accounts_with_details');

    logger.success(`Reservist account approved successfully: ${reservistAccount.email}`, {
      context: 'PUT /api/admin/reservists/[id]/approve',
      reservistId,
      approvedBy: user.id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      message: 'Reservist account approved successfully',
      data: updatedReservist
    }, { status: 200 });

  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'PUT /api/admin/reservists/[id]/approve' });
    logger.separator();
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
