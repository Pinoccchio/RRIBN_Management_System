import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { UpdateAnnouncementInput } from '@/lib/types/announcement';

/**
 * GET /api/staff/announcements/[id]
 *
 * Fetch single announcement details
 *
 * Returns: AnnouncementWithCreator
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to announcement detail', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to access announcement detail', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Fetch announcement
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
      .eq('id', params.id)
      .single();

    if (fetchError || !announcement) {
      logger.error('Failed to fetch announcement', fetchError, { announcementId: params.id });
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
    logger.error('Unexpected error in GET /api/staff/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/staff/announcements/[id]
 *
 * Update an existing announcement
 *
 * Body: UpdateAnnouncementInput
 *
 * Security:
 * - Staff can only update their own announcements (RLS enforced)
 * - If updating target_companies, verify staff has access
 * - If changing from draft to published, send notifications
 *
 * Returns: Updated announcement
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to update announcement', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to update announcement', {
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

    // Fetch existing announcement
    const { data: existingAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingAnnouncement) {
      logger.error('Failed to fetch announcement for update', fetchError, { announcementId: params.id });
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    // Verify staff created this announcement
    if (existingAnnouncement.created_by !== user.id) {
      logger.warn('Staff attempted to update another user\'s announcement', {
        userId: user.id,
        announcementId: params.id,
        createdBy: existingAnnouncement.created_by,
      });
      return NextResponse.json(
        { success: false, error: 'You can only update your own announcements' },
        { status: 403 }
      );
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
    if (published_at !== undefined) updateData.published_at = published_at;
    if (expires_at !== undefined) updateData.expires_at = expires_at;

    logger.info('Updating announcement', {
      userId: user.id,
      announcementId: params.id,
      updates: Object.keys(updateData),
    });

    // Detect if changing from draft to published
    const wasUnpublished = !existingAnnouncement.published_at;
    const nowPublished = updateData.published_at || (published_at === '' ? new Date().toISOString() : null);
    const shouldNotify = wasUnpublished && nowPublished;

    // Update announcement
    const { data: updatedAnnouncement, error: updateError } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', params.id)
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
      logger.error('Failed to update announcement', updateError, { announcementId: params.id });
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

    logger.success('Announcement updated successfully', {
      userId: user.id,
      announcementId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: transformedAnnouncement,
      message: 'Announcement updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/staff/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/announcements/[id]
 *
 * Delete an announcement
 *
 * Security:
 * - Staff can delete their own announcements (RLS policy allows)
 * - Admin+ can delete any announcement
 *
 * Returns: Success message
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to delete announcement', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to delete announcement', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff only' }, { status: 403 });
    }

    // Fetch announcement
    const { data: announcement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !announcement) {
      logger.error('Failed to fetch announcement for deletion', fetchError, { announcementId: params.id });
      return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
    }

    // Verify staff created this announcement
    if (announcement.created_by !== user.id) {
      logger.warn('Staff attempted to delete another user\'s announcement', {
        userId: user.id,
        announcementId: params.id,
        createdBy: announcement.created_by,
      });
      return NextResponse.json(
        { success: false, error: 'You can only delete your own announcements' },
        { status: 403 }
      );
    }

    logger.info('Deleting announcement', {
      userId: user.id,
      announcementId: params.id,
    });

    // Delete the announcement (RLS now allows staff deletion of own announcements)
    const { error: deleteError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      logger.error('Failed to delete announcement', deleteError, { announcementId: params.id });
      return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
    }

    logger.success('Announcement deleted successfully', {
      userId: user.id,
      announcementId: params.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/staff/announcements/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
