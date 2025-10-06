import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { AuditAction } from '@/lib/types/audit-log';

/**
 * GET /api/super-admin/audit-logs
 *
 * Fetch audit logs with filtering and pagination
 * Returns audit logs with user details and pagination metadata
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/super-admin/audit-logs' });

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
      logger.error('Non-super-admin user attempted to access audit logs', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Super Admin only' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entity_type') || '';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    logger.info('Fetching audit logs with filters', {
      action,
      entityType,
      search,
      dateFrom,
      dateTo,
      page,
      limit,
    });

    // Build query with LEFT JOIN to accounts and profiles
    let query = supabase
      .from('audit_logs')
      .select(
        `
        *,
        accounts:user_id (
          email,
          profiles (
            first_name,
            last_name
          )
        )
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (action && action !== 'all') {
      query = query.eq('action', action);
    }

    if (entityType && entityType !== 'all') {
      query = query.eq('entity_type', entityType);
    }

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      // Add 1 day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Apply search filter (user email or entity_id)
    if (search) {
      // For search, we need to filter after fetching since we're searching joined data
      // We'll apply this filter after getting the results
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: auditLogs, error: fetchError, count } = await query;

    if (fetchError) {
      logger.error('Failed to fetch audit logs', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    // Transform and filter by search if provided
    let transformedLogs = (auditLogs || []).map((log: any) => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      old_values: log.old_values,
      new_values: log.new_values,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      created_at: log.created_at,
      user_email: log.accounts?.email || null,
      first_name: log.accounts?.profiles?.first_name || null,
      last_name: log.accounts?.profiles?.last_name || null,
    }));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      transformedLogs = transformedLogs.filter((log) => {
        const userEmail = log.user_email?.toLowerCase() || '';
        const firstName = log.first_name?.toLowerCase() || '';
        const lastName = log.last_name?.toLowerCase() || '';
        const entityId = log.entity_id?.toLowerCase() || '';

        return (
          userEmail.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          entityId.includes(searchLower)
        );
      });
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    logger.success(`Fetched ${transformedLogs.length} audit logs`, {
      page,
      limit,
      total: count,
      totalPages,
    });

    return NextResponse.json({
      success: true,
      data: transformedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in audit logs API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
