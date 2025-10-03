import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/stats
 * Get dashboard statistics for the current staff member
 * Filtered by assigned companies only
 */
export async function GET() {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/stats' });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/stats' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/stats',
      userId: user.id,
      email: user.email || undefined
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/stats',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('Authorization successful', { context: 'GET /api/staff/stats', userId: user.id });

    // Get staff's assigned companies
    logger.dbQuery('SELECT', 'staff_details', `Fetching assigned companies for user: ${user.id.substring(0, 8)}...`);
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      logger.dbSuccess('SELECT', 'staff_details');
      logger.info('No assigned companies - Returning zero stats', {
        context: 'GET /api/staff/stats',
        userId: user.id
      });
      logger.separator();
      // Staff has no assigned companies, return zero stats
      return NextResponse.json({
        success: true,
        data: {
          totalReservists: 0,
          pendingDocuments: 0,
          upcomingTrainings: 0,
          pendingActions: 0,
        },
      });
    }

    logger.dbSuccess('SELECT', 'staff_details');
    const assignedCompanies = staffDetails.assigned_companies;
    logger.debug(`Assigned companies: ${assignedCompanies.join(', ')}`, { context: 'GET /api/staff/stats' });

    // Count total reservists in assigned companies
    logger.dbQuery('SELECT', 'reservist_details', 'Counting reservists in assigned companies');
    const { count: reservistCount } = await supabase
      .from('reservist_details')
      .select('id', { count: 'exact', head: true })
      .in('company', assignedCompanies);
    logger.dbSuccess('SELECT', 'reservist_details');

    // Count pending documents from reservists in assigned companies
    logger.dbQuery('SELECT', 'documents', 'Fetching pending documents');
    const { data: pendingDocsData } = await supabase
      .from('documents')
      .select('id, reservist_id')
      .eq('status', 'pending');
    logger.dbSuccess('SELECT', 'documents');

    // Filter documents by checking if reservist is in assigned companies
    let pendingDocumentsCount = 0;
    if (pendingDocsData && pendingDocsData.length > 0) {
      logger.dbQuery('SELECT', 'reservist_details', 'Filtering documents by assigned companies');
      const reservistIds = pendingDocsData.map(doc => doc.reservist_id);
      const { data: reservistsInCompanies } = await supabase
        .from('reservist_details')
        .select('id')
        .in('id', reservistIds)
        .in('company', assignedCompanies);
      logger.dbSuccess('SELECT', 'reservist_details');

      pendingDocumentsCount = reservistsInCompanies?.length || 0;
    }

    // Count upcoming trainings (company-specific or system-wide)
    logger.dbQuery('SELECT', 'training_sessions', 'Counting upcoming trainings');
    const { count: upcomingTrainingsCount } = await supabase
      .from('training_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .or(`company.in.(${assignedCompanies.join(',')}),company.is.null`);
    logger.dbSuccess('SELECT', 'training_sessions');

    // Pending actions = pending documents (simplified for now)
    const pendingActions = pendingDocumentsCount;

    const stats = {
      totalReservists: reservistCount || 0,
      pendingDocuments: pendingDocumentsCount,
      upcomingTrainings: upcomingTrainingsCount || 0,
      pendingActions,
    };

    logger.success(`Staff stats retrieved - Reservists: ${stats.totalReservists}, Pending Docs: ${stats.pendingDocuments}, Trainings: ${stats.upcomingTrainings}`, {
      context: 'GET /api/staff/stats',
      userId: user.id
    });
    logger.separator();

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/stats' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
