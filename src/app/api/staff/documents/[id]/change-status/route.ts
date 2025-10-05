import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { addSignedUrlToDocument } from '@/lib/utils/storage';
import type { ChangeStatusInput, DocumentWithReservist, DocumentStatus } from '@/lib/types/document';

/**
 * PUT /api/staff/documents/[id]/change-status
 * Change document status (Admin/Super Admin only)
 * Allows flexible status transitions with mandatory reason tracking
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `PUT /api/staff/documents/${params.id}/change-status` });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify staff or above (staff does most of the work, so they get full control!)
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    // Get staff's assigned companies (even for admin, for RLS compliance)
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      return NextResponse.json({ success: false, error: 'No assigned companies' }, { status: 403 });
    }

    const assignedCompanies = staffDetails.assigned_companies;

    // Fetch document to check company and current status
    logger.dbQuery('SELECT', 'documents', `Fetching document: ${params.id}`);
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
      logger.warn('Document not found');
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const company = document.reservist?.reservist_details?.company;
    if (!company || !assignedCompanies.includes(company)) {
      logger.warn('Access denied - Document not in assigned companies');
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Document not in your assigned companies'
      }, { status: 403 });
    }

    logger.dbSuccess('SELECT', 'documents');

    // Parse request body
    const body: ChangeStatusInput = await request.json();

    // Validate required fields
    if (!body.new_status) {
      return NextResponse.json({ success: false, error: 'new_status is required' }, { status: 400 });
    }

    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'reason is required for status changes' }, { status: 400 });
    }

    // Validate status value
    const validStatuses: DocumentStatus[] = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(body.new_status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    // Prevent no-op changes
    if (document.status === body.new_status) {
      return NextResponse.json({
        success: false,
        error: `Document is already ${body.new_status}`
      }, { status: 400 });
    }

    logger.info(`Status change: ${document.status} → ${body.new_status}`);
    logger.info(`Reason: ${body.reason}`);

    // Prepare update object based on new status
    const updateData: any = {
      status: body.new_status,
      updated_at: new Date().toISOString(),
    };

    // Handle validated_by and validated_at
    if (body.new_status === 'verified' || body.new_status === 'rejected') {
      updateData.validated_by = user.id;
      updateData.validated_at = new Date().toISOString();
    } else if (body.new_status === 'pending') {
      // Revert to pending - clear validation info
      updateData.validated_by = null;
      updateData.validated_at = null;
    }

    // Handle rejection_reason
    if (body.new_status === 'rejected') {
      // For rejected status, use the reason as rejection_reason
      updateData.rejection_reason = body.reason;
    } else {
      // For other statuses, clear rejection_reason
      updateData.rejection_reason = null;
    }

    // Handle notes
    if (body.notes) {
      updateData.notes = body.notes;
    }

    // Update document
    logger.dbQuery('UPDATE', 'documents', `Changing status for document: ${params.id}`);
    const { error: updateError } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', params.id);

    if (updateError) {
      logger.dbError('UPDATE', 'documents', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update document status' }, { status: 500 });
    }

    logger.dbSuccess('UPDATE', 'documents');

    // Create notification for reservist
    const notificationMessages = {
      pending: `Your ${document.document_type} document status was changed to Pending. Reason: ${body.reason}`,
      verified: `Your ${document.document_type} document has been verified and approved.${body.reason ? ` Note: ${body.reason}` : ''}`,
      rejected: `Your ${document.document_type} document was rejected. Reason: ${body.reason}`,
    };

    logger.dbQuery('INSERT', 'notifications', `Creating notification for reservist`);
    await supabase
      .from('notifications')
      .insert({
        user_id: document.reservist_id,
        title: `Document Status Changed`,
        message: notificationMessages[body.new_status],
        type: 'document',
        reference_id: document.id,
        reference_table: 'documents',
      });

    logger.success(`Successfully changed document status to: ${body.new_status}`);

    // Fetch updated document with full details
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
      logger.debug('Generating signed URL for updated document...');
      const documentWithSignedUrl = await addSignedUrlToDocument(documentData, 3600);

      logger.separator();
      return NextResponse.json({
        success: true,
        message: `Document status changed to ${body.new_status} successfully`,
        data: documentWithSignedUrl
      });
    }

    logger.separator();
    return NextResponse.json({
      success: true,
      message: `Document status changed to ${body.new_status} successfully`
    });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
