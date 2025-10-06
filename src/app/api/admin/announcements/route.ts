import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { CreateAnnouncementInput } from '@/lib/types/announcement';

/**
 * GET /api/admin/announcements
 *
 * List all announcements (battalion-wide, no company restriction)
 *
 * Query params:
 * - status: 'all' | 'active' | 'inactive' | 'draft'
 * - priority: 'low' | 'normal' | 'high' | 'urgent'
 * - company: optional filter by specific company
 * - limit: number (default: 100)
 * - offset: number (default: 0)
 *
 * Returns: AnnouncementWithCreator[]
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to admin announcements', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access admin announcements', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || '';
    const companyFilter = searchParams.get('company') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('Fetching announcements for admin', {
      status,
      priority,
      companyFilter,
      limit,
      offset,
      userId: user.id,
    });

    // Build query - admin sees ALL announcements
    let query = supabase
      .from('announcements')
      .select(
        `
        *,
        creator:accounts!announcements_created_by_fkey(
          id,
          email,
          profile:profiles(first_name, last_name)
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true).not('published_at', 'is', null);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    } else if (status === 'draft') {
      query = query.is('published_at', null);
    }

    // Apply priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: announcements, error: fetchError } = await query;

    if (fetchError) {
      logger.error('Failed to fetch announcements', fetchError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
    }

    // Optional company filter (admin can filter by specific company if desired)
    let filteredAnnouncements = announcements;
    if (companyFilter) {
      filteredAnnouncements = announcements.filter((announcement: any) => {
        // Show if announcement targets all companies (null or empty array)
        if (!announcement.target_companies || announcement.target_companies.length === 0) {
          return true;
        }
        // Show if announcement targets the filtered company
        return announcement.target_companies.includes(companyFilter);
      });
    }

    logger.info(`Fetched announcements for admin: ${announcements.length} total${companyFilter ? ` → ${filteredAnnouncements.length} for ${companyFilter}` : ''}`, {
      userId: user.id,
    });

    // Transform data to match AnnouncementWithCreator interface
    const transformedAnnouncements = filteredAnnouncements.map((announcement: any) => ({
      ...announcement,
      creator: {
        first_name: announcement.creator?.profile?.first_name || 'Unknown',
        last_name: announcement.creator?.profile?.last_name || 'User',
        email: announcement.creator?.email || '',
      },
    }));

    logger.success(`Fetched ${transformedAnnouncements.length} announcements for admin`, { userId: user.id });

    return NextResponse.json({
      success: true,
      data: transformedAnnouncements,
      total: transformedAnnouncements.length,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/admin/announcements', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/announcements
 *
 * Create a new announcement (admin can target any company or system-wide)
 *
 * Body: CreateAnnouncementInput
 *
 * Security:
 * - Admin can target ANY company or create system-wide (target_companies = null)
 * - No company validation required
 * - Auto-sets created_by to current admin user
 * - If publish_now: true, sets published_at to now()
 * - Sends notifications to targeted users if published
 *
 * Returns: Created announcement with creator info
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to create announcement', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to create announcement', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Parse request body
    const body: CreateAnnouncementInput = await request.json();
    const { title, content, priority, target_companies, target_roles, publish_now, is_active, expires_at } = body;

    // Validate input
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Title must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Content must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (!priority || !['low', 'normal', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority. Must be: low, normal, high, or urgent' },
        { status: 400 }
      );
    }

    // Admin can target ANY company - no validation needed
    // target_companies = null means system-wide (all companies)
    // target_companies = [] also means system-wide
    // target_companies = ['ALPHA', 'BRAVO'] targets specific companies

    // Prepare announcement data
    const announcementData: any = {
      title: title.trim(),
      content: content.trim(),
      priority,
      target_companies: target_companies || null,
      target_roles: target_roles || null,
      created_by: user.id,
      is_active: is_active ?? (publish_now ? true : false),
      published_at: publish_now ? new Date().toISOString() : null,
      expires_at: expires_at || null,
    };

    logger.info('Creating announcement (admin)', {
      userId: user.id,
      title: announcementData.title,
      priority,
      publish_now,
      targetCompanies: target_companies || 'system-wide',
    });

    // Create announcement
    const { data: announcement, error: createError } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select(
        `
        *,
        creator:accounts!announcements_created_by_fkey(
          id,
          email,
          profile:profiles(first_name, last_name)
        )
      `
      )
      .single();

    if (createError) {
      logger.error('Failed to create announcement', createError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to create announcement' }, { status: 500 });
    }

    // Send notifications if published AND active
    if (publish_now && announcement && announcement.is_active) {
      try {
        // Determine recipients based on target_companies and target_roles
        let recipientsQuery = supabase.from('accounts').select('id, role').eq('role', 'reservist');

        // Filter by companies if specified
        if (target_companies && target_companies.length > 0) {
          const { data: reservistsInCompanies } = await supabase
            .from('reservist_details')
            .select('id')
            .in('company', target_companies);

          const reservistIds = reservistsInCompanies?.map((r) => r.id) || [];
          if (reservistIds.length > 0) {
            recipientsQuery = recipientsQuery.in('id', reservistIds);
          } else {
            // No recipients in target companies
            recipientsQuery = recipientsQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Empty result
          }
        }

        const { data: recipients } = await recipientsQuery;

        if (recipients && recipients.length > 0) {
          const notifications = recipients.map((recipient) => ({
            user_id: recipient.id,
            title: announcement.title,
            message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
            type: 'announcement' as const,
            reference_id: announcement.id,
            reference_table: 'announcements',
            is_read: false,
            created_at: new Date().toISOString(),
          }));

          await supabase.from('notifications').insert(notifications);
          logger.success(`Sent ${notifications.length} notifications for announcement`, {
            announcementId: announcement.id,
          });
        }
      } catch (notifError) {
        logger.warn('Failed to send notifications', notifError);
        // Don't fail the request if notifications fail
      }
    }

    // Transform announcement data
    const transformedAnnouncement = {
      ...announcement,
      creator: {
        first_name: announcement.creator?.profile?.first_name || 'Unknown',
        last_name: announcement.creator?.profile?.last_name || 'User',
        email: announcement.creator?.email || '',
      },
    };

    logger.success('Announcement created successfully by admin', {
      userId: user.id,
      announcementId: announcement.id,
      published: !!publish_now,
    });

    return NextResponse.json({
      success: true,
      data: transformedAnnouncement,
      message: 'Announcement created successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/admin/announcements', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
