import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/notifications/[id]/read
 *
 * Mark a specific notification as read
 * Security: User can only mark their own notifications
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `PUT /api/notifications/${params.id}/read` });

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

    const notificationId = params.id;

    logger.info('Marking notification as read', {
      userId: user.id,
      notificationId,
    });

    // Verify notification belongs to user and mark as read
    const { data: notification, error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Security: Only update user's own notifications
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to mark notification as read', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    if (!notification) {
      logger.warn('Notification not found or does not belong to user', {
        userId: user.id,
        notificationId,
      });
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    logger.success('Notification marked as read', {
      userId: user.id,
      notificationId,
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/notifications/[id]/read', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
