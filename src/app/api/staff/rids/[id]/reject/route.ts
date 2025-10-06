import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/rids/[id]/reject
 * Reject RIDS (submitted → rejected)
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
    const body = await request.json();
    const { rejection_reason } = body;

    if (!rejection_reason || rejection_reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    logger.info('Rejecting RIDS', {
      context: 'PUT /api/staff/rids/[id]/reject',
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
          error: `Cannot reject RIDS with status: ${currentRIDS.status}`,
        },
        { status: 400 }
      );
    }

    // Update status to rejected
    const { data, error } = await supabase
      .from('rids_forms')
      .update({
        status: 'rejected',
        rejection_reason: rejection_reason.trim(),
        updated_at: new Date().toISOString(),
        // Clear approval fields
        approved_at: null,
        approved_by: null,
      })
      .eq('id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to reject RIDS', error, {
        context: 'PUT /api/staff/rids/[id]/reject',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Create notification for staff/reservist (optional - implement later)
    // await createNotification({
    //   user_id: currentRIDS.reservist_id,
    //   type: 'rids_rejected',
    //   title: 'RIDS Rejected',
    //   message: `Your RIDS has been rejected. Reason: ${rejection_reason}`,
    //   reference_id: ridsId,
    // });

    logger.success('RIDS rejected successfully', {
      context: 'PUT /api/staff/rids/[id]/reject',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'RIDS rejected successfully',
    });
  } catch (error) {
    logger.error('Unexpected error rejecting RIDS', error, {
      context: 'PUT /api/staff/rids/[id]/reject',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
