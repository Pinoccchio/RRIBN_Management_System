import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/stats
 * Get dashboard statistics for admin role
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/stats' });

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/admin/stats' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/admin/stats',
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
        context: 'GET /api/admin/stats',
        userId: user.id,
        role: accountData?.role
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can access this resource' },
        { status: 403 }
      );
    }

    logger.success('Authorization successful', { context: 'GET /api/admin/stats', userId: user.id });

    // Fetch statistics
    logger.dbQuery('SELECT', 'companies', 'Counting total companies');
    const { count: companiesCount, error: companiesError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (companiesError) {
      logger.dbError('SELECT', 'companies', companiesError);
    } else {
      logger.dbSuccess('SELECT', 'companies');
    }

    logger.dbQuery('SELECT', 'staff_details + accounts', 'Counting active staff');
    const { count: staffCount, error: staffError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'staff')
      .eq('status', 'active');

    if (staffError) {
      logger.dbError('SELECT', 'staff_details', staffError);
    } else {
      logger.dbSuccess('SELECT', 'staff_details');
    }

    logger.dbQuery('SELECT', 'reservist_details + accounts', 'Counting total reservists');
    const { count: reservistsCount, error: reservistsError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reservist');

    if (reservistsError) {
      logger.dbError('SELECT', 'reservist_details', reservistsError);
    } else {
      logger.dbSuccess('SELECT', 'reservist_details');
    }

    logger.dbQuery('SELECT', 'accounts', 'Counting pending reservists');
    const { count: pendingCount, error: pendingError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reservist')
      .eq('status', 'pending');

    if (pendingError) {
      logger.dbError('SELECT', 'accounts', pendingError);
    } else {
      logger.dbSuccess('SELECT', 'accounts');
    }

    const stats = {
      totalCompanies: companiesCount || 0,
      activeStaff: staffCount || 0,
      totalReservists: reservistsCount || 0,
      pendingActions: pendingCount || 0,
    };

    logger.success('Dashboard statistics fetched successfully', {
      context: 'GET /api/admin/stats',
      stats
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/admin/stats' });
    logger.separator();
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
