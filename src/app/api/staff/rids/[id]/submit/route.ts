import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/rids/[id]/submit
 * Submit RIDS for approval (draft → submitted)
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

    logger.info('Submitting RIDS for approval', {
      context: 'PUT /api/staff/rids/[id]/submit',
      user_id: user.id,
      rids_id: ridsId,
    });

    // Check current status
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

    if (currentRIDS.status !== 'draft' && currentRIDS.status !== 'rejected') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot submit RIDS with status: ${currentRIDS.status}`,
        },
        { status: 400 }
      );
    }

    // Update status to submitted
    const { data, error } = await supabase
      .from('rids_forms')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submitted_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to submit RIDS', error, {
        context: 'PUT /api/staff/rids/[id]/submit',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Insert history record
    const { error: historyError } = await supabase
      .from('rids_status_history')
      .insert({
        rids_form_id: ridsId,
        from_status: currentRIDS.status,
        to_status: 'submitted',
        reason: 'RIDS submitted for approval',
        notes: null,
        changed_by: user.id,
        action_type: 'submit',
        metadata: {},
      });

    if (historyError) {
      logger.error('Failed to insert RIDS status history', historyError, {
        context: 'PUT /api/staff/rids/[id]/submit',
      });
      // Don't fail the request if history insert fails - log and continue
    }

    // Create notification for admins/staff (optional - implement later)
    // await createNotification({
    //   type: 'rids_submitted',
    //   title: 'New RIDS Submitted',
    //   message: `RIDS for reservist ${reservist_name} has been submitted for approval`,
    //   reference_id: ridsId,
    // });

    logger.success('RIDS submitted successfully', {
      context: 'PUT /api/staff/rids/[id]/submit',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'RIDS submitted for approval successfully',
    });
  } catch (error) {
    logger.error('Unexpected error submitting RIDS', error, {
      context: 'PUT /api/staff/rids/[id]/submit',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
