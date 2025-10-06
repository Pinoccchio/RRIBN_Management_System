import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/super-admin/oversight-data
 *
 * Fetch system-wide oversight data for super admin
 * Returns pending actions, validation queues, and activity monitoring data
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/super-admin/oversight-data' });

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
      logger.error('Non-super-admin user attempted to access oversight data', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Super Admin only' },
        { status: 403 }
      );
    }

    logger.info('Fetching super admin oversight data');

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('date_range') || '30'; // days
    const companyFilter = searchParams.get('company') || 'all';

    const daysAgo = parseInt(dateRange);
    const dateThreshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    // Fetch statistics in parallel
    const [
      { count: pendingAccounts },
      { count: pendingDocuments },
      { count: pendingRIDS },
      { count: activeTrainingSessions },
      { data: accountStatusChanges },
      { data: documentQueue },
      { data: companyDistribution },
    ] = await Promise.all([
      // Pending Account Approvals
      supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Pending Document Validations
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Pending RIDS Forms
      supabase
        .from('rids_forms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted'),

      // Active Training Sessions
      supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ongoing'),

      // Recent Account Status Changes (from audit_logs)
      supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          old_values,
          new_values,
          created_at,
          accounts:user_id (
            email,
            profiles (
              first_name,
              last_name
            )
          )
        `)
        .eq('entity_type', 'accounts')
        .in('action', ['update', 'approve', 'reject'])
        .gte('created_at', dateThreshold)
        .order('created_at', { ascending: false })
        .limit(50),

      // Document Validation Queue
      supabase
        .from('documents')
        .select(`
          id,
          document_type,
          status,
          created_at,
          reservist_id,
          accounts!documents_reservist_id_fkey (
            profiles (
              first_name,
              last_name
            ),
            reservist_details (
              company
            )
          )
        `)
        .in('status', ['pending', 'rejected'])
        .gte('created_at', dateThreshold)
        .order('created_at', { ascending: true })
        .limit(100),

      // Company Distribution
      supabase
        .from('companies')
        .select(`
          id,
          code,
          name,
          is_active
        `)
        .order('code', { ascending: true }),
    ]);

    // Transform account status changes
    const transformedStatusChanges = (accountStatusChanges || [])
      .filter((log: any) => {
        // Only include logs that have status changes
        return log.old_values?.status || log.new_values?.status;
      })
      .map((log: any) => {
        const oldStatus = log.old_values?.status || '-';
        const newStatus = log.new_values?.status || '-';
        const changedBy = log.accounts
          ? `${log.accounts.profiles?.first_name || ''} ${log.accounts.profiles?.last_name || ''}`.trim() || log.accounts.email
          : 'System';

        // Get account name from entity_id if available
        const accountName = log.new_values?.email || log.old_values?.email || 'Unknown';
        const accountRole = log.new_values?.role || log.old_values?.role || '-';

        return {
          id: log.id,
          accountName,
          role: accountRole,
          fromStatus: oldStatus,
          toStatus: newStatus,
          action: log.action,
          changedBy,
          changedAt: log.created_at,
          entityId: log.entity_id,
        };
      });

    // Transform document queue
    const transformedDocumentQueue = (documentQueue || []).map((doc: any) => {
      const reservistName =
        `${doc.accounts?.profiles?.first_name || ''} ${doc.accounts?.profiles?.last_name || ''}`.trim() ||
        'Unknown';
      const daysPending = Math.floor(
        (Date.now() - new Date(doc.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const company = doc.accounts?.reservist_details?.company || null;

      return {
        id: doc.id,
        reservistName,
        documentType: doc.document_type,
        status: doc.status,
        submittedDate: doc.created_at,
        daysPending,
        company,
      };
    });

    // Fetch personnel counts for each company
    const companyDistributionData = await Promise.all(
      (companyDistribution || []).map(async (company: any) => {
        // Get reservist count - match by company CODE
        const { count: reservistCount } = await supabase
          .from('reservist_details')
          .select('*', { count: 'exact', head: true })
          .eq('company', company.code);

        // Get staff count - check if CODE is in assigned_companies array
        const { count: staffCount } = await supabase
          .from('staff_details')
          .select('*', { count: 'exact', head: true })
          .contains('assigned_companies', [company.code]);

        return {
          id: company.id,
          code: company.code,
          name: company.name,
          reservistCount: reservistCount || 0,
          staffCount: staffCount || 0,
          isActive: company.is_active,
        };
      })
    );

    // Apply company filter if needed
    let filteredStatusChanges = transformedStatusChanges;
    let filteredDocumentQueue = transformedDocumentQueue;

    if (companyFilter && companyFilter !== 'all') {
      // Filter documents by company
      filteredDocumentQueue = transformedDocumentQueue.filter((doc: any) => {
        return doc.company === companyFilter;
      });

      // Filter account status changes by company
      // We need to fetch the company for each changed account (entity_id)
      const statusChangesWithCompany = await Promise.all(
        transformedStatusChanges.map(async (change: any) => {
          if (!change.entityId) return { ...change, company: null };

          const { data: accountData } = await supabase
            .from('accounts')
            .select(`
              id,
              reservist_details (
                company
              ),
              staff_details (
                assigned_companies
              )
            `)
            .eq('id', change.entityId)
            .single();

          // Get company from reservist_details or staff_details
          let accountCompany = null;
          if (accountData?.reservist_details?.company) {
            accountCompany = accountData.reservist_details.company;
          } else if (accountData?.staff_details?.assigned_companies) {
            // For staff, check if the filter company is in their assigned companies
            accountCompany = accountData.staff_details.assigned_companies.includes(companyFilter)
              ? companyFilter
              : null;
          }

          return {
            ...change,
            company: accountCompany,
          };
        })
      );

      filteredStatusChanges = statusChangesWithCompany.filter((change: any) => {
        return change.company === companyFilter;
      });
    }

    const oversightData = {
      stats: {
        pendingAccounts: pendingAccounts || 0,
        pendingDocuments: pendingDocuments || 0,
        pendingRIDS: pendingRIDS || 0,
        activeTrainingSessions: activeTrainingSessions || 0,
      },
      accountStatusChanges: filteredStatusChanges,
      documentQueue: filteredDocumentQueue,
      companyDistribution: companyDistributionData,
    };

    logger.success('Super admin oversight data fetched successfully', {
      stats: oversightData.stats,
      statusChangesCount: filteredStatusChanges.length,
      documentQueueCount: filteredDocumentQueue.length,
      companiesCount: companyDistributionData.length,
    });

    return NextResponse.json({
      success: true,
      data: oversightData,
    });
  } catch (error) {
    logger.error('Unexpected error in super admin oversight data API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
