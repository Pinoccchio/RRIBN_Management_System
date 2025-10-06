import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/rids/[id]/sections/promotion-history/[entryId]
 * Update promotion history entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ridsId, entryId } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('rids_promotion_history')
      .update({
        entry_number: body.entry_number,
        rank: body.rank,
        date_of_rank: body.date_of_rank,
        authority: body.authority,
        action_type: body.action_type,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('rids_form_id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update promotion history entry', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('Promotion history entry updated', { id: entryId });
    return NextResponse.json({
      success: true,
      data,
      message: 'Promotion history entry updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected error updating promotion history', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/rids/[id]/sections/promotion-history/[entryId]
 * Delete promotion history entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ridsId, entryId } = await params;

    const { error } = await supabase
      .from('rids_promotion_history')
      .delete()
      .eq('id', entryId)
      .eq('rids_form_id', ridsId);

    if (error) {
      logger.error('Failed to delete promotion history entry', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('Promotion history entry deleted', { id: entryId });
    return NextResponse.json({
      success: true,
      message: 'Promotion history entry deleted successfully',
    });
  } catch (error) {
    logger.error('Unexpected error deleting promotion history', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
