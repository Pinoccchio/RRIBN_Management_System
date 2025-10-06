import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { UpdateAnnouncementInput } from '@/lib/types/announcement';

/**
 * GET /api/admin/announcements/[id]
 *
 * Fetch single announcement details (admin can access any announcement)
 *
 * Returns: AnnouncementWithCreator
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to announcement detail', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access announcement detail', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch announcement (admin can access any announcement)
    const { data: announcement, error: fetchError } = await supabase
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
      .eq('id', id)
      .single();

    if (fetchError || !announcement) {
      logger.error('Failed to fetch announcement', fetchError, { announcementId: id });
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    // Transform data
    const transformedAnnouncement = {
      ...announcement,
      creator: {
        first_name: announcement.creator?.profile?.first_name || 'Unknown',
        last_name: announcement.creator?.profile?.last_name || 'User',
        email: announcement.creator?.email || '',
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedAnnouncement,
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/admin/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/announcements/[id]
 *
 * Update an existing announcement (admin can update any announcement)
 *
 * Body: UpdateAnnouncementInput
 *
 * Security:
 * - Admin can update ANY announcement (not just their own)
 * - Admin can target ANY company or create system-wide
 * - If changing from draft to published, send notifications
 *
 * Returns: Updated announcement
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to update announcement', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to update announcement', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch existing announcement (admin can update any announcement - no ownership check)
    const { data: existingAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAnnouncement) {
      logger.error('Failed to fetch announcement for update', fetchError, { announcementId: id });
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    // Parse request body
    const body: UpdateAnnouncementInput = await request.json();
    const { title, content, priority, target_companies, target_roles, is_active, published_at, expires_at } = body;

    // Validate input
    if (title !== undefined && title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Title must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (content !== undefined && content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Content must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (priority !== undefined && !['low', 'normal', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority. Must be: low, normal, high, or urgent' },
        { status: 400 }
      );
    }

    // Admin can target ANY company - but validate format and existence
    // Validate target_companies format
    if (target_companies !== undefined) {
      if (!Array.isArray(target_companies)) {
        return NextResponse.json(
          { success: false, error: 'target_companies must be an array' },
          { status: 400 }
        );
      }

      // If companies specified, verify they exist and are active
      if (target_companies.length > 0) {
        const { data: validCompanies } = await supabase
          .from('companies')
          .select('code')
          .eq('is_active', true)
          .in('code', target_companies);

        const validCodes = validCompanies?.map((c) => c.code) || [];
        const invalidCompanies = target_companies.filter((c) => !validCodes.includes(c));

        if (invalidCompanies.length > 0) {
          logger.warn('Invalid or inactive companies in update request', {
            userId: user.id,
            invalidCompanies,
            requestedCompanies: target_companies,
          });
          return NextResponse.json(
            {
              success: false,
              error: `Invalid or inactive companies: ${invalidCompanies.join(', ')}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (target_companies !== undefined) updateData.target_companies = target_companies.length > 0 ? target_companies : null;
    if (target_roles !== undefined) updateData.target_roles = target_roles.length > 0 ? target_roles : null;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (published_at !== undefined) updateData.published_at = published_at && published_at.trim() ? published_at : null;
    if (expires_at !== undefined) updateData.expires_at = expires_at && expires_at.trim() ? expires_at : null;

    logger.info('Updating announcement (admin)', {
      userId: user.id,
      announcementId: id,
      updates: Object.keys(updateData),
      targetCompanies: updateData.target_companies,
      isActive: updateData.is_active,
      publishedAt: updateData.published_at,
    });

    // Detect if changing from draft to published
    const wasUnpublished = !existingAnnouncement.published_at;
    const nowPublished = updateData.published_at || (published_at === '' ? new Date().toISOString() : null);
    const shouldNotify = wasUnpublished && nowPublished;

    // Update announcement
    const { data: updatedAnnouncement, error: updateError } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
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

    if (updateError) {
      logger.error('Failed to update announcement', updateError, { announcementId: id });
      return NextResponse.json({ success: false, error: 'Failed to update announcement' }, { status: 500 });
    }

    // Send notifications if publishing a draft AND setting to active
    if (shouldNotify && updatedAnnouncement && updatedAnnouncement.is_active) {
      try {
        const targetCompanies = updatedAnnouncement.target_companies || [];

        // Determine recipients
        let recipientsQuery = supabase.from('accounts').select('id, role').eq('role', 'reservist');

        // Filter by companies if specified
        if (targetCompanies.length > 0) {
          const { data: reservistsInCompanies } = await supabase
            .from('reservist_details')
            .select('id')
            .in('company', targetCompanies);

          const reservistIds = reservistsInCompanies?.map((r) => r.id) || [];
          if (reservistIds.length > 0) {
            recipientsQuery = recipientsQuery.in('id', reservistIds);
          }
        }

        const { data: recipients } = await recipientsQuery;

        if (recipients && recipients.length > 0) {
          const notifications = recipients.map((recipient) => ({
            user_id: recipient.id,
            title: updatedAnnouncement.title,
            message: updatedAnnouncement.content.substring(0, 200) + (updatedAnnouncement.content.length > 200 ? '...' : ''),
            type: 'announcement' as const,
            reference_id: updatedAnnouncement.id,
            reference_table: 'announcements',
            is_read: false,
            created_at: new Date().toISOString(),
          }));

          await supabase.from('notifications').insert(notifications);
          logger.success(`Sent ${notifications.length} notifications for published announcement`, {
            announcementId: updatedAnnouncement.id,
          });
        }
      } catch (notifError) {
        logger.warn('Failed to send notifications', notifError);
        // Don't fail the request if notifications fail
      }
    }

    // Transform data
    const transformedAnnouncement = {
      ...updatedAnnouncement,
      creator: {
        first_name: updatedAnnouncement.creator?.profile?.first_name || 'Unknown',
        last_name: updatedAnnouncement.creator?.profile?.last_name || 'User',
        email: updatedAnnouncement.creator?.email || '',
      },
    };

    logger.success('Announcement updated successfully by admin', {
      userId: user.id,
      announcementId: id,
    });

    return NextResponse.json({
      success: true,
      data: transformedAnnouncement,
      message: 'Announcement updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/admin/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 *
 * Delete an announcement (admin can delete any announcement)
 *
 * Security:
 * - Admin can delete ANY announcement (not just their own)
 *
 * Returns: Success message
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to delete announcement', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to delete announcement', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch announcement (verify it exists - admin can delete any announcement)
    const { data: announcement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !announcement) {
      logger.error('Failed to fetch announcement for deletion', fetchError, { announcementId: id });
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    logger.info('Deleting announcement (admin)', {
      userId: user.id,
      announcementId: id,
    });

    // Delete the announcement (admin can delete any announcement)
    const { error: deleteError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Failed to delete announcement', deleteError, { announcementId: id });
      return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
    }

    logger.success('Announcement deleted successfully by admin', {
      userId: user.id,
      announcementId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/admin/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
