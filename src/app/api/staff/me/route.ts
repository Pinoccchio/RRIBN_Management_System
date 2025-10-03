import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/me
 * Get current authenticated staff member's details
 */
export async function GET() {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/me' });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/me' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/me',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/me',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/staff/me', userId: user.id });

    // Fetch staff details with profile and staff_details
    logger.dbQuery('SELECT', 'accounts', `Fetching staff details for user: ${user.id.substring(0, 8)}...`);
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(`
        id,
        email,
        role,
        status,
        profile:profiles!inner(first_name, last_name, phone, profile_photo_url),
        staff_details:staff_details!inner(employee_id, position, assigned_companies)
      `)
      .eq('id', user.id)
      .single();

    if (accountError || !account) {
      logger.dbError('SELECT', 'accounts', accountError);
      logger.warn('Staff account not found', { context: 'GET /api/staff/me', userId: user.id });
      return NextResponse.json({ success: false, error: 'Staff account not found' }, { status: 404 });
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Return formatted staff data
    const staffData = {
      id: account.id,
      email: account.email,
      role: account.role,
      status: account.status,
      firstName: account.profile.first_name,
      lastName: account.profile.last_name,
      phone: account.profile.phone,
      profilePhotoUrl: account.profile.profile_photo_url,
      employeeId: account.staff_details.employee_id,
      position: account.staff_details.position,
      assignedCompanies: account.staff_details.assigned_companies || [],
    };

    logger.success(`Staff details retrieved: ${account.profile.first_name} ${account.profile.last_name}`, {
      context: 'GET /api/staff/me',
      userId: user.id
    });
    logger.separator();

    return NextResponse.json({ success: true, data: staffData });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/me' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
