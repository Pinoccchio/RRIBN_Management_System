import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/rids/[id]/approve
 * Approve RIDS (submitted → approved)
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

    logger.info('Approving RIDS', {
      context: 'PUT /api/staff/rids/[id]/approve',
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

    if (currentRIDS.status !== 'submitted') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve RIDS with status: ${currentRIDS.status}`,
        },
        { status: 400 }
      );
    }

    // Update status to approved
    const { data, error } = await supabase
      .from('rids_forms')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to approve RIDS', error, {
        context: 'PUT /api/staff/rids/[id]/approve',
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
        to_status: 'approved',
        reason: 'RIDS approved by staff',
        notes: null,
        changed_by: user.id,
        action_type: 'approve',
        metadata: {},
      });

    if (historyError) {
      logger.error('Failed to insert RIDS status history', historyError, {
        context: 'PUT /api/staff/rids/[id]/approve',
      });
      // Don't fail the request if history insert fails - log and continue
    }

    // Create notification for reservist (optional - implement later)
    // await createNotification({
    //   user_id: currentRIDS.reservist_id,
    //   type: 'rids_approved',
    //   title: 'RIDS Approved',
    //   message: 'Your RIDS has been approved',
    //   reference_id: ridsId,
    // });

    logger.success('RIDS approved successfully', {
      context: 'PUT /api/staff/rids/[id]/approve',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'RIDS approved successfully',
    });
  } catch (error) {
    logger.error('Unexpected error approving RIDS', error, {
      context: 'PUT /api/staff/rids/[id]/approve',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
