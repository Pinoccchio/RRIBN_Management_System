import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { addSignedUrlToDocument } from '@/lib/utils/storage';
import type { ValidateDocumentInput, DocumentWithReservist } from '@/lib/types/document';

/**
 * PUT /api/staff/documents/[id]/validate
 * Validate/approve a document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `PUT /api/staff/documents/${params.id}/validate` });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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

    // Check if document exists and is in assigned companies
    const { data: document } = await supabase
      .from('documents')
      .select(`
        *,
        reservist:accounts!documents_reservist_id_fkey (
          reservist_details!inner (
            company
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const company = document.reservist?.reservist_details?.company;
    if (!company || !assignedCompanies.includes(company)) {
      return NextResponse.json({ success: false, error: 'Forbidden - Document not in your assigned companies' }, { status: 403 });
    }

    // Security check: Only pending documents can be validated via this endpoint
    // (Use change-status endpoint for other status transitions)
    if (document.status !== 'pending') {
      logger.warn(`Validation attempted on non-pending document (status: ${document.status})`);
      return NextResponse.json({
        success: false,
        error: `Cannot validate document with status '${document.status}'. Only pending documents can be validated.`
      }, { status: 400 });
    }

    // Parse request body
    const body: ValidateDocumentInput = await request.json();

    // Update document
    logger.dbQuery('UPDATE', 'documents', `Validating document: ${params.id}`);
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        notes: body.notes || null,
        rejection_reason: null, // Clear any previous rejection reason
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      logger.dbError('UPDATE', 'documents', updateError);
      return NextResponse.json({ success: false, error: 'Failed to validate document' }, { status: 500 });
    }

    logger.dbSuccess('UPDATE', 'documents');

    // Create notification for reservist
    logger.dbQuery('INSERT', 'notifications', `Creating notification for reservist`);
    await supabase
      .from('notifications')
      .insert({
        user_id: document.reservist_id,
        title: 'Document Verified',
        message: `Your ${document.document_type} document has been verified and approved.`,
        type: 'document',
        reference_id: document.id,
        reference_table: 'documents',
      });

    logger.success(`Successfully validated document: ${params.id}`);

    // Fetch updated document with reservist details
    logger.dbQuery('SELECT', 'documents', `Fetching updated document: ${params.id}`);
    const { data: updatedDoc } = await supabase
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

    if (updatedDoc) {
      // Transform to DocumentWithReservist
      const documentData: DocumentWithReservist = {
        id: updatedDoc.id,
        reservist_id: updatedDoc.reservist_id,
        document_type: updatedDoc.document_type,
        file_url: updatedDoc.file_url,
        file_name: updatedDoc.file_name,
        file_size: updatedDoc.file_size,
        mime_type: updatedDoc.mime_type,
        status: updatedDoc.status,
        validated_by: updatedDoc.validated_by,
        validated_at: updatedDoc.validated_at,
        rejection_reason: updatedDoc.rejection_reason,
        notes: updatedDoc.notes,
        version: updatedDoc.version,
        is_current: updatedDoc.is_current,
        created_at: updatedDoc.created_at,
        updated_at: updatedDoc.updated_at,
        reservist: {
          first_name: updatedDoc.reservist?.profiles?.first_name || '',
          middle_name: updatedDoc.reservist?.profiles?.middle_name,
          last_name: updatedDoc.reservist?.profiles?.last_name || '',
          email: updatedDoc.reservist?.email || '',
          company: updatedDoc.reservist?.reservist_details?.company,
          rank: updatedDoc.reservist?.reservist_details?.rank,
          service_number: updatedDoc.reservist?.reservist_details?.service_number || '',
        },
        validator: updatedDoc.validator?.profiles ? {
          first_name: updatedDoc.validator.profiles.first_name,
          last_name: updatedDoc.validator.profiles.last_name,
        } : null,
      };

      // Generate signed URL for secure access
      logger.debug('Generating signed URL for validated document...');
      const documentWithSignedUrl = await addSignedUrlToDocument(documentData, 3600);

      logger.separator();
      return NextResponse.json({
        success: true,
        message: 'Document validated successfully',
        data: documentWithSignedUrl
      });
    }

    logger.separator();
    return NextResponse.json({ success: true, message: 'Document validated successfully' });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
