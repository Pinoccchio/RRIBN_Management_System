import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/super-admin/dashboard-data
 *
 * Fetch system-wide dashboard data for super admin
 * Returns statistics, recent administrators, audit logs, role distribution, and security advisories
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/super-admin/dashboard-data' });

  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || account.role !== 'super_admin') {
      logger.error('Non-super-admin user attempted to access super admin dashboard', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Super Admin only' },
        { status: 403 }
      );
    }

    logger.info('Fetching super admin dashboard data');

    // Fetch statistics in parallel
    const [
      { count: totalAdministrators },
      { count: totalCompanies },
      { count: systemUsers },
      { count: activeAccounts },
      { count: auditLogs24h },
      { data: recentAdmins },
      { data: recentAuditLogs },
      { data: roleDistribution },
    ] = await Promise.all([
      // Total Administrators (super_admin + admin)
      supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .in('role', ['super_admin', 'admin']),

      // Total Companies
      supabase
        .from('companies')
        .select('*', { count: 'exact', head: true }),

      // System Users (all accounts)
      supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true }),

      // Active Accounts
      supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),

      // Audit Logs (last 24 hours)
      supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

      // Recent Administrators (last 5 created)
      supabase
        .from('accounts')
        .select(`
          id,
          email,
          role,
          status,
          created_at,
          profiles!inner (
            first_name,
            last_name
          )
        `)
        .in('role', ['super_admin', 'admin'])
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent Audit Logs (last 5)
      supabase
        .from('audit_logs')
        .select('id, action, entity_type, created_at, user_id, accounts!audit_logs_user_id_fkey(email)')
        .order('created_at', { ascending: false })
        .limit(5),

      // Role Distribution
      supabase
        .from('accounts')
        .select('role')
        .then(({ data }) => {
          if (!data) return { data: [] };
          const distribution = data.reduce((acc: any, curr: any) => {
            acc[curr.role] = (acc[curr.role] || 0) + 1;
            return acc;
          }, {});
          return {
            data: Object.entries(distribution).map(([role, count]) => ({
              role,
              count,
            })),
          };
        }),
    ]);

    // Transform recent administrators
    const transformedAdmins = (recentAdmins || []).map((admin: any) => ({
      id: admin.id,
      name: `${admin.profiles?.first_name || ''} ${admin.profiles?.last_name || ''}`.trim() || 'Unknown',
      email: admin.email,
      role: admin.role,
      status: admin.status,
      createdAt: admin.created_at,
    }));

    // Transform audit logs
    const transformedAuditLogs = (recentAuditLogs || []).map((log: any) => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      userEmail: log.accounts?.email || 'System',
      createdAt: log.created_at,
    }));

    const dashboardData = {
      stats: {
        totalAdministrators: totalAdministrators || 0,
        totalCompanies: totalCompanies || 0,
        systemUsers: systemUsers || 0,
        activeAccounts: activeAccounts || 0,
        auditLogs24h: auditLogs24h || 0,
      },
      recentAdministrators: transformedAdmins,
      recentAuditLogs: transformedAuditLogs,
      roleDistribution: roleDistribution || [],
    };

    logger.success('Super admin dashboard data fetched successfully', {
      stats: dashboardData.stats,
      recentAdminsCount: transformedAdmins.length,
      recentAuditLogsCount: transformedAuditLogs.length,
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Unexpected error in super admin dashboard data API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
