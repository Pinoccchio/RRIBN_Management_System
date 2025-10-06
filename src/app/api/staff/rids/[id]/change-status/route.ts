import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

type RIDSStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface ChangeStatusInput {
  new_status: RIDSStatus;
  reason: string;
  notes?: string;
}

/**
 * PUT /api/staff/rids/[id]/change-status
 * Change RIDS status - allows flexible status transitions with mandatory reason tracking
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ridsId } = await params;

    // Parse request body
    const body: ChangeStatusInput = await request.json();

    // Validate required fields
    if (!body.new_status) {
      return NextResponse.json(
        { success: false, error: 'new_status is required' },
        { status: 400 }
      );
    }

    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'reason is required for status changes' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: RIDSStatus[] = ['draft', 'submitted', 'approved', 'rejected'];
    if (!validStatuses.includes(body.new_status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      );
    }

    logger.info('Changing RIDS status', {
      context: 'PUT /api/staff/rids/[id]/change-status',
      user_id: user.id,
      rids_id: ridsId,
      new_status: body.new_status,
      reason: body.reason,
    });

    // Fetch current RIDS to check existing status
    const { data: currentRIDS, error: fetchError } = await supabase
      .from('rids_forms')
      .select('status, reservist_id')
      .eq('id', ridsId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'RIDS not found' },
        { status: 404 }
      );
    }

    // Prevent no-op changes
    if (currentRIDS.status === body.new_status) {
      return NextResponse.json(
        {
          success: false,
          error: `RIDS is already ${body.new_status}`
        },
        { status: 400 }
      );
    }

    logger.info(`Status change: ${currentRIDS.status} → ${body.new_status}`);

    // Prepare update object based on new status
    const updateData: any = {
      status: body.new_status,
      updated_at: new Date().toISOString(),
    };

    // Handle approved_by and approved_at
    if (body.new_status === 'approved') {
      updateData.approved_by = user.id;
      updateData.approved_at = new Date().toISOString();
      updateData.rejection_reason = null; // Clear rejection reason
    } else if (body.new_status === 'rejected') {
      updateData.rejection_reason = body.reason;
      updateData.approved_by = null;
      updateData.approved_at = null;
    } else if (body.new_status === 'draft' || body.new_status === 'submitted') {
      // Revert to draft/submitted - clear approval and rejection info
      updateData.approved_by = null;
      updateData.approved_at = null;
      updateData.rejection_reason = null;
    }

    // Update RIDS
    const { data, error } = await supabase
      .from('rids_forms')
      .update(updateData)
      .eq('id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update RIDS status', error, {
        context: 'PUT /api/staff/rids/[id]/change-status',
      });
      return NextResponse.json(
        { success: false, error: 'Failed to update RIDS status' },
        { status: 500 }
      );
    }

    // Determine action_type based on status transition
    let action_type = 'manual_change'; // Default
    if (body.new_status === 'submitted') {
      action_type = 'submit';
    } else if (body.new_status === 'approved') {
      action_type = 'approve';
    } else if (body.new_status === 'rejected') {
      action_type = 'reject';
    } else if (body.new_status === 'draft' && (currentRIDS.status === 'approved' || currentRIDS.status === 'rejected')) {
      action_type = 'revert';
    }

    // Insert history record
    const { error: historyError } = await supabase
      .from('rids_status_history')
      .insert({
        rids_form_id: ridsId,
        from_status: currentRIDS.status,
        to_status: body.new_status,
        reason: body.reason,
        notes: body.notes || null,
        changed_by: user.id,
        action_type: action_type,
        metadata: {},
      });

    if (historyError) {
      logger.error('Failed to insert RIDS status history', historyError, {
        context: 'PUT /api/staff/rids/[id]/change-status',
      });
      // Don't fail the request if history insert fails - log and continue
    }

    // Create notification for reservist (optional - implement later)
    // const notificationMessages = {
    //   draft: `Your RIDS status was changed to Draft. Reason: ${body.reason}`,
    //   submitted: `Your RIDS was submitted for approval. Reason: ${body.reason}`,
    //   approved: `Your RIDS has been approved.${body.reason ? ` Note: ${body.reason}` : ''}`,
    //   rejected: `Your RIDS was rejected. Reason: ${body.reason}`,
    // };
    // await supabase
    //   .from('notifications')
    //   .insert({
    //     user_id: currentRIDS.reservist_id,
    //     title: 'RIDS Status Changed',
    //     message: notificationMessages[body.new_status],
    //     type: 'rids',
    //     reference_id: ridsId,
    //   });

    logger.success('RIDS status changed successfully', {
      context: 'PUT /api/staff/rids/[id]/change-status',
      rids_id: ridsId,
      new_status: body.new_status,
    });

    return NextResponse.json({
      success: true,
      data,
      message: `RIDS status changed to ${body.new_status} successfully`,
    });
  } catch (error) {
    logger.error('Unexpected error changing RIDS status', error, {
      context: 'PUT /api/staff/rids/[id]/change-status',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
