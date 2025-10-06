import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { CreateAnnouncementInput } from '@/lib/types/announcement';

/**
 * GET /api/staff/announcements
 *
 * List announcements visible to staff
 *
 * Query params:
 * - status: 'all' | 'active' | 'inactive' | 'draft'
 * - priority: 'low' | 'normal' | 'high' | 'urgent'
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
      logger.error('Unauthorized access attempt to announcements', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff and get assigned companies
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to access announcements', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch staff details' }, { status: 500 });
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.info('Fetching announcements', { status, priority, limit, offset, userId: user.id });

    // Build query
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

    // Filter announcements based on staff's assigned companies
    // Staff can only see announcements where:
    // 1. target_companies is NULL (targets all companies), OR
    // 2. target_companies array contains at least one of their assigned companies
    const filteredAnnouncements = announcements.filter((announcement: any) => {
      // If target_companies is null or empty, announcement targets all companies
      if (!announcement.target_companies || announcement.target_companies.length === 0) {
        return true;
      }

      // Check if any of the announcement's target companies match staff's assigned companies
      return announcement.target_companies.some((targetCompany: string) =>
        assignedCompanies.includes(targetCompany)
      );
    });

    logger.info(`Filtered announcements: ${announcements.length} total → ${filteredAnnouncements.length} for staff's companies`, {
      userId: user.id,
      assignedCompanies,
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

    logger.success(`Fetched ${transformedAnnouncements.length} announcements for staff's assigned companies`, { userId: user.id });

    return NextResponse.json({
      success: true,
      data: transformedAnnouncements,
      total: transformedAnnouncements.length,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/staff/announcements', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/staff/announcements
 *
 * Create a new announcement
 *
 * Body: CreateAnnouncementInput
 *
 * Security:
 * - Staff can only target their assigned companies
 * - Auto-sets created_by to current staff user
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

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to create announcement', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json({ success: false, error: 'Failed to fetch staff details' }, { status: 500 });
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

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

    // Verify staff can only target their assigned companies
    if (target_companies && target_companies.length > 0) {
      const unauthorized = target_companies.some((company) => !assignedCompanies.includes(company));
      if (unauthorized) {
        logger.warn('Staff attempted to target unassigned companies', {
          userId: user.id,
          attemptedCompanies: target_companies,
          assignedCompanies,
        });
        return NextResponse.json(
          { success: false, error: 'You can only target companies you are assigned to' },
          { status: 403 }
        );
      }
    }

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

    logger.info('Creating announcement', {
      userId: user.id,
      title: announcementData.title,
      priority,
      publish_now,
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

    logger.success('Announcement created successfully', {
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
    logger.error('Unexpected error in POST /api/staff/announcements', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
