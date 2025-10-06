import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  userName: string;
  timestamp: string;
}

/**
 * GET /api/staff/recent-activity
 * Get recent activity for reservists in the staff's assigned companies
 * Shows audit logs from the last 7 days
 */
export async function GET() {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/recent-activity' });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/recent-activity' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/recent-activity',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/recent-activity',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/staff/recent-activity', userId: user.id });

    // Get staff's assigned companies
    logger.dbQuery('SELECT', 'staff_details', `Fetching assigned companies for user: ${user.id.substring(0, 8)}...`);
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      logger.dbSuccess('SELECT', 'staff_details');
      logger.info('No assigned companies - Returning empty activity', {
        context: 'GET /api/staff/recent-activity',
        userId: user.id
      });
      logger.separator();
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    logger.dbSuccess('SELECT', 'staff_details');
    const assignedCompanies = staffDetails.assigned_companies;
    logger.debug(`Assigned companies: ${assignedCompanies.join(', ')}`, { context: 'GET /api/staff/recent-activity' });

    // Get all reservists in assigned companies to filter activity
    logger.dbQuery('SELECT', 'reservist_details', 'Fetching reservists in assigned companies');
    const { data: reservistsInCompanies } = await supabase
      .from('reservist_details')
      .select('id')
      .in('company', assignedCompanies);
    logger.dbSuccess('SELECT', 'reservist_details');

    const reservistIds = reservistsInCompanies?.map(r => r.id) || [];

    if (reservistIds.length === 0) {
      logger.info('No reservists in assigned companies - Returning empty activity', {
        context: 'GET /api/staff/recent-activity'
      });
      logger.separator();
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Fetch recent audit logs for these reservists
    logger.dbQuery('SELECT', 'audit_logs', 'Fetching recent activity from audit logs');
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        created_at,
        user_id
      `)
      .in('entity_id', reservistIds)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (auditError) {
      logger.error('Error fetching audit logs', auditError, { context: 'GET /api/staff/recent-activity' });
      return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'audit_logs');

    if (!auditLogs || auditLogs.length === 0) {
      logger.info('No recent activity found', { context: 'GET /api/staff/recent-activity' });
      logger.separator();
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get user profiles for the activity
    const userIds = [...new Set(auditLogs.map(log => log.user_id))];
    logger.dbQuery('SELECT', 'profiles', 'Fetching user profiles for activity');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);
    logger.dbSuccess('SELECT', 'profiles');

    // Create a map of user profiles
    const profileMap = new Map(
      profiles?.map(p => [p.id, `${p.first_name} ${p.last_name}`]) || []
    );

    // Format activity data
    const activities: RecentActivity[] = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      userName: profileMap.get(log.user_id) || 'Unknown User',
      timestamp: log.created_at,
    }));

    logger.success(`Retrieved ${activities.length} recent activities`, {
      context: 'GET /api/staff/recent-activity',
      count: activities.length
    });
    logger.separator();

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/recent-activity' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
