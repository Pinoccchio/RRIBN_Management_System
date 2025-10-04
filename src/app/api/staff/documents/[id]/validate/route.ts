import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { ValidateDocumentInput } from '@/lib/types/document';

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
    logger.separator();

    return NextResponse.json({ success: true, message: 'Document validated successfully' });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
