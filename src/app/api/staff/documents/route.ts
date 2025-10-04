import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { DocumentWithReservist, PaginatedDocumentsResponse } from '@/lib/types/document';

/**
 * GET /api/staff/documents
 * List documents from reservists in staff's assigned companies
 * COMPANY-FILTERED: Only shows documents from reservists in assigned companies
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/documents' });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    // Get staff's assigned companies
    logger.dbQuery('SELECT', 'staff_details', `Fetching assigned companies for user: ${user.id.substring(0, 8)}...`);
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      logger.info('No assigned companies - Returning empty list');
      logger.separator();

      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    }

    logger.dbSuccess('SELECT', 'staff_details');
    const assignedCompanies = staffDetails.assigned_companies;
    logger.debug(`Assigned companies: ${assignedCompanies.join(', ')}`);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const documentType = searchParams.get('document_type') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    logger.debug(`Filters: status=${status}, documentType=${documentType}, search=${search}, page=${page}`);

    // Build query - join documents with reservist details and profiles
    let query = supabase
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
        ),
        validator:accounts!documents_validated_by_fkey (
          profiles!inner (
            first_name,
            last_name
          )
        )
      `, { count: 'exact' })
      .eq('is_current', true); // Only current versions

    // Filter by assigned companies - check if reservist's company is in assigned companies
    // We'll do this filtering in the application layer since we can't do complex filters with nested relations

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply document type filter
    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    logger.dbQuery('SELECT', 'documents', `Fetching documents list (page ${page})`);
    const { data, error, count } = await query;

    if (error) {
      logger.dbError('SELECT', 'documents', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 });
    }

    logger.dbSuccess('SELECT', 'documents');

    // Filter by assigned companies and search (application-level filtering)
    let filteredDocuments = (data || []).filter((doc: any) => {
      const company = doc.reservist?.reservist_details?.company;
      return company && assignedCompanies.includes(company);
    });

    // Apply search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filteredDocuments = filteredDocuments.filter((doc: any) => {
        const firstName = doc.reservist?.profiles?.first_name?.toLowerCase() || '';
        const middleName = doc.reservist?.profiles?.middle_name?.toLowerCase() || '';
        const lastName = doc.reservist?.profiles?.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${middleName} ${lastName}`;
        const email = doc.reservist?.email?.toLowerCase() || '';
        const serviceNumber = doc.reservist?.reservist_details?.service_number?.toLowerCase() || '';
        const docType = doc.document_type?.toLowerCase() || '';

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          serviceNumber.includes(query) ||
          docType.includes(query)
        );
      });
    }

    // Transform data to match DocumentWithReservist interface
    const documents: DocumentWithReservist[] = filteredDocuments.map((doc: any) => ({
      id: doc.id,
      reservist_id: doc.reservist_id,
      document_type: doc.document_type,
      file_url: doc.file_url,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      status: doc.status,
      validated_by: doc.validated_by,
      validated_at: doc.validated_at,
      rejection_reason: doc.rejection_reason,
      notes: doc.notes,
      version: doc.version,
      is_current: doc.is_current,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      reservist: {
        first_name: doc.reservist?.profiles?.first_name || '',
        middle_name: doc.reservist?.profiles?.middle_name,
        last_name: doc.reservist?.profiles?.last_name || '',
        email: doc.reservist?.email || '',
        company: doc.reservist?.reservist_details?.company,
        rank: doc.reservist?.reservist_details?.rank,
        service_number: doc.reservist?.reservist_details?.service_number || '',
      },
      validator: doc.validator?.profiles ? {
        first_name: doc.validator.profiles.first_name,
        last_name: doc.validator.profiles.last_name,
      } : null,
    }));

    const response: PaginatedDocumentsResponse = {
      data: documents,
      pagination: {
        page,
        limit,
        total: filteredDocuments.length,
        totalPages: Math.ceil(filteredDocuments.length / limit),
      },
    };

    logger.success(`Fetched ${documents.length} documents from assigned companies (filtered total: ${filteredDocuments.length})`);
    logger.separator();

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
