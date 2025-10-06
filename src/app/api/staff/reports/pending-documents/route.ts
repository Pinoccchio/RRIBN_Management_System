import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reports/pending-documents
 *
 * Fetch pending documents data for report generation
 * Returns all pending documents from reservists in assigned companies
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reports/pending-documents' });

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

    // Get staff details and assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Staff details not found', staffError);
      return NextResponse.json(
        { success: false, error: 'Staff details not found' },
        { status: 404 }
      );
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    if (assignedCompanies.length === 0) {
      logger.info('No assigned companies - Returning empty data');
      return NextResponse.json({ success: true, data: [] });
    }

    logger.info('Fetching pending documents data for companies', { assignedCompanies });

    // Fetch all pending documents with reservist details
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

    // Filter by assigned companies
    const filteredDocuments = (documents || []).filter((doc: any) => {
      const company = doc.reservist?.reservist_details?.company;
      return company && assignedCompanies.includes(company);
    });

    // Transform data for report
    const pendingDocsData = filteredDocuments.map((doc: any) => {
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

    logger.success(
      `Fetched ${pendingDocsData.length} pending documents for report`,
      {
        count: pendingDocsData.length,
        companies: assignedCompanies,
      }
    );

    return NextResponse.json({
      success: true,
      data: pendingDocsData,
      companies: assignedCompanies,
    });
  } catch (error) {
    logger.error('Unexpected error in pending documents report API', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
