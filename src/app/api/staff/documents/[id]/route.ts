import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { DocumentWithReservist } from '@/lib/types/document';

/**
 * GET /api/staff/documents/[id]
 * Get single document details (must be from reservist in staff's assigned companies)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `GET /api/staff/documents/${params.id}` });

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
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      return NextResponse.json({ success: false, error: 'No assigned companies' }, { status: 403 });
    }

    const assignedCompanies = staffDetails.assigned_companies;

    // Fetch document with reservist details
    logger.dbQuery('SELECT', 'documents', `Fetching document: ${params.id}`);
    const { data, error } = await supabase
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
          profiles (
            first_name,
            last_name
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      logger.dbError('SELECT', 'documents', error);
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Check if document's reservist is in assigned companies
    const company = data.reservist?.reservist_details?.company;
    if (!company || !assignedCompanies.includes(company)) {
      logger.warn(`Access denied - Document's reservist not in assigned companies`, {
        documentCompany: company,
        assignedCompanies
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Document not in your assigned companies' }, { status: 403 });
    }

    logger.dbSuccess('SELECT', 'documents');

    // Transform to DocumentWithReservist
    const document: DocumentWithReservist = {
      id: data.id,
      reservist_id: data.reservist_id,
      document_type: data.document_type,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      mime_type: data.mime_type,
      status: data.status,
      validated_by: data.validated_by,
      validated_at: data.validated_at,
      rejection_reason: data.rejection_reason,
      notes: data.notes,
      version: data.version,
      is_current: data.is_current,
      created_at: data.created_at,
      updated_at: data.updated_at,
      reservist: {
        first_name: data.reservist?.profiles?.first_name || '',
        middle_name: data.reservist?.profiles?.middle_name,
        last_name: data.reservist?.profiles?.last_name || '',
        email: data.reservist?.email || '',
        company: data.reservist?.reservist_details?.company,
        rank: data.reservist?.reservist_details?.rank,
        service_number: data.reservist?.reservist_details?.service_number || '',
      },
      validator: data.validator?.profiles ? {
        first_name: data.validator.profiles.first_name,
        last_name: data.validator.profiles.last_name,
      } : null,
    };

    logger.success(`Fetched document details: ${data.document_type}`);
    logger.separator();

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
