import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/notifications/mark-all-read
 *
 * Mark all unread notifications as read for the current user
 */
export async function PUT(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'PUT /api/notifications/mark-all-read' });

  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Marking all notifications as read', { userId: user.id });

    // Update all unread notifications for this user
    const { data: notifications, error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id');

    if (updateError) {
      logger.error('Failed to mark all notifications as read', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notifications' },
        { status: 500 }
      );
    }

    const updatedCount = notifications?.length || 0;

    logger.success(`Marked ${updatedCount} notifications as read`, {
      userId: user.id,
      count: updatedCount,
    });

    return NextResponse.json({
      success: true,
      count: updatedCount,
      message: `${updatedCount} notification${updatedCount !== 1 ? 's' : ''} marked as read`,
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/notifications/mark-all-read', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
