import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/reports/pending-documents
 *
 * Fetch battalion-wide pending documents data for report generation
 * Returns ALL pending documents from all reservists across all companies (admin has full access)
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/reports/pending-documents' });

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

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access battalion pending documents report', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    logger.info('Fetching battalion-wide pending documents data (admin)');

    // Fetch ALL pending documents with reservist details (no company filter)
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select(`
        *,
        reservist:accounts!documents_reservist_id_fkey (
          email,
          profiles!inner (
            first_name,
            middle_name,
            last_name
          ),
          reservist_details!inner (
            company,
            rank,
            service_number
          )
        )
      `)
      .eq('status', 'pending')
      .eq('is_current', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      logger.error('Failed to fetch pending documents', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending documents' },
        { status: 500 }
      );
    }

    // Transform data for report (no filtering - admin sees ALL)
    const pendingDocsData = (documents || []).map((doc: any) => {
      const firstName = doc.reservist?.profiles?.first_name || '';
      const lastName = doc.reservist?.profiles?.last_name || '';
      const submittedDate = new Date(doc.created_at);
      const daysPending = Math.floor(
        (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: doc.id,
        reservistName: `${lastName}, ${firstName}`.trim(),
        rank: doc.reservist?.reservist_details?.rank || 'N/A',
        serviceNumber: doc.reservist?.reservist_details?.service_number || 'N/A',
        company: doc.reservist?.reservist_details?.company || 'N/A',
        documentType: doc.document_type || 'N/A',
        fileName: doc.file_name || 'N/A',
        submittedDate: doc.created_at || null,
        daysPending,
        status: doc.status || 'pending',
      };
    });

    // Sort by days pending (oldest first)
    pendingDocsData.sort((a, b) => b.daysPending - a.daysPending);

    // Get unique companies for metadata
    const companies = [...new Set(pendingDocsData.map(d => d.company))].filter(c => c !== 'N/A');

    // Calculate urgency statistics
    const urgent = pendingDocsData.filter(d => d.daysPending > 7).length;
    const attention = pendingDocsData.filter(d => d.daysPending >= 4 && d.daysPending <= 7).length;
    const recent = pendingDocsData.filter(d => d.daysPending < 4).length;

    logger.success(
      `Fetched ${pendingDocsData.length} pending documents for battalion report`,
      {
        count: pendingDocsData.length,
        companiesCount: companies.length,
        companies,
        urgent,
        attention,
        recent,
      }
    );

    return NextResponse.json({
      success: true,
      data: pendingDocsData,
      companies,
      metadata: {
        totalPending: pendingDocsData.length,
        companiesCount: companies.length,
        urgency: {
          urgent, // > 7 days
          attention, // 4-7 days
          recent, // < 4 days
        },
      },
    });
  } catch (error) {
    logger.error('Unexpected error in pending documents report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
