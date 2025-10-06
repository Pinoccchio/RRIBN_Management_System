import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/notifications
 *
 * Fetch notifications for the current user
 * Query params:
 * - type: Filter by notification type (document, training, announcement, account, system)
 * - read: Filter by read status (true/false)
 * - limit: Number of notifications to return (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/notifications' });

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const read = searchParams.get('read');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('Fetching notifications', {
      userId: user.id,
      filters: { type, read, limit, offset },
    });

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (read !== null) {
      const isRead = read === 'true';
      query = query.eq('is_read', isRead);
    }

    const { data: notifications, error: fetchError, count } = await query;

    if (fetchError) {
      logger.error('Failed to fetch notifications', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    logger.success(`Fetched ${notifications?.length || 0} notifications`, {
      userId: user.id,
      total: count,
    });

    return NextResponse.json({
      success: true,
      data: notifications || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/notifications', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
