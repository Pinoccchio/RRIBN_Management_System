import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { UpdateTrainingInput } from '@/lib/types/training';

/**
 * GET /api/admin/training/[id]
 *
 * Get a single training session by ID (battalion-wide access for admin)
 *
 * Returns: Training session details with registrations
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to training details', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to access training details', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch training session (no company restriction for admin)
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Failed to fetch training session', error, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Fetch registration statistics
    const { data: registrations } = await supabase
      .from('training_registrations')
      .select('status, completion_status')
      .eq('training_session_id', id);

    const stats = {
      registration_count:
        registrations?.filter(
          (r) => r.status === 'registered' || r.status === 'attended' || r.status === 'completed'
        ).length || 0,
      attended_count: registrations?.filter((r) => r.status === 'attended' || r.status === 'completed').length || 0,
      completed_count: registrations?.filter((r) => r.status === 'completed').length || 0,
      passed_count: registrations?.filter((r) => r.completion_status === 'passed').length || 0,
      failed_count: registrations?.filter((r) => r.completion_status === 'failed').length || 0,
      pending_count:
        registrations?.filter((r) => r.completion_status === 'pending' || r.completion_status === null).length || 0,
    };

    // Fetch registrations with reservist details
    const { data: registrationsWithDetails, error: regError } = await supabase
      .from('training_registrations')
      .select(
        `
        id,
        training_session_id,
        reservist_id,
        status,
        attended_at,
        completion_status,
        certificate_url,
        notes,
        created_at,
        updated_at,
        reservist:accounts!training_registrations_reservist_id_fkey(
          email,
          profiles!inner(
            first_name,
            last_name,
            middle_name
          ),
          reservist_details!inner(
            service_number,
            rank,
            company
          )
        )
      `
      )
      .eq('training_session_id', id);

    if (regError) {
      logger.error('Failed to fetch training registrations', regError, { trainingId: id });
      // Continue without registrations rather than failing completely
    }

    // Transform the data to match RegistrationWithReservist type
    const formattedRegistrations = (registrationsWithDetails || []).map((reg: any) => ({
      id: reg.id,
      training_session_id: reg.training_session_id,
      reservist_id: reg.reservist_id,
      status: reg.status,
      attended_at: reg.attended_at,
      completion_status: reg.completion_status,
      certificate_url: reg.certificate_url,
      notes: reg.notes,
      created_at: reg.created_at,
      updated_at: reg.updated_at,
      reservist: {
        first_name: reg.reservist.profiles.first_name,
        last_name: reg.reservist.profiles.last_name,
        middle_name: reg.reservist.profiles.middle_name,
        email: reg.reservist.email,
        service_number: reg.reservist.reservist_details.service_number,
        rank: reg.reservist.reservist_details.rank,
        company: reg.reservist.reservist_details.company,
      },
    }));

    logger.success('Fetched training session details', { userId: user.id, trainingId: id });

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        ...stats,
        registrations: formattedRegistrations,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in GET /api/admin/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/training/[id]
 *
 * Update a training session (admin can update any training)
 *
 * Body: UpdateTrainingInput
 *
 * Returns: Updated training session
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to update training', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to update training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Verify training exists
    const { data: existingTraining, error: fetchError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTraining) {
      logger.error('Training session not found', fetchError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Parse request body
    const body: UpdateTrainingInput = await request.json();

    // Validate fields
    if (body.title !== undefined && body.title.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Title is required (min 3 characters)' }, { status: 400 });
    }

    if (body.end_date && body.scheduled_date) {
      const scheduledDate = new Date(body.scheduled_date);
      const endDate = new Date(body.end_date);
      if (endDate <= scheduledDate) {
        return NextResponse.json({ success: false, error: 'End date must be after scheduled date' }, { status: 400 });
      }
    }

    if (body.capacity !== null && body.capacity !== undefined && body.capacity <= 0) {
      return NextResponse.json({ success: false, error: 'Capacity must be greater than 0' }, { status: 400 });
    }

    // Note: Admin can update training to any company or system-wide (company = null)
    // No company validation needed for admin

    logger.info('Updating training session', {
      userId: user.id,
      trainingId: id,
      changes: body,
    });

    // Build update object (only include defined fields)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.company !== undefined) updateData.company = body.company || null; // Allow null for system-wide
    if (body.training_category !== undefined) updateData.training_category = body.training_category || null;
    if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.capacity !== undefined) updateData.capacity = body.capacity || null;
    if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;

    // Update training session
    const { data: updatedTraining, error: updateError } = await supabase
      .from('training_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update training session', updateError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to update training session' }, { status: 500 });
    }

    logger.success('Training session updated successfully', {
      userId: user.id,
      trainingId: id,
    });

    return NextResponse.json({
      success: true,
      data: updatedTraining,
      message: 'Training session updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/admin/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/training/[id]
 *
 * Delete a training session (admin can delete any training, with safety checks)
 *
 * Returns: Success message
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to delete training', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin or super_admin
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!account || (account.role !== 'admin' && account.role !== 'super_admin')) {
      logger.error('Non-admin user attempted to delete training', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch training session
    const { data: training, error: fetchError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !training) {
      logger.error('Training session not found', fetchError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Safety checks
    // 1. Cannot delete completed trainings
    if (training.status === 'completed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete completed training sessions',
        },
        { status: 400 }
      );
    }

    // 2. Check if training has awarded hours in training_hours table
    const { data: awardedHours, error: hoursError } = await supabase
      .from('training_hours')
      .select('id')
      .eq('training_session_id', id)
      .limit(1);

    if (hoursError) {
      logger.error('Failed to check training hours', hoursError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to verify training hours' }, { status: 500 });
    }

    if (awardedHours && awardedHours.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete training with awarded hours. Hours are permanent records for promotion eligibility.',
        },
        { status: 400 }
      );
    }

    logger.info('Deleting training session', {
      userId: user.id,
      trainingId: id,
      title: training.title,
    });

    // Delete associated registrations first (cascade)
    const { error: deleteRegsError } = await supabase
      .from('training_registrations')
      .delete()
      .eq('training_session_id', id);

    if (deleteRegsError) {
      logger.error('Failed to delete training registrations', deleteRegsError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to delete training registrations' }, { status: 500 });
    }

    // Delete training session
    const { error: deleteError } = await supabase.from('training_sessions').delete().eq('id', id);

    if (deleteError) {
      logger.error('Failed to delete training session', deleteError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to delete training session' }, { status: 500 });
    }

    logger.success('Training session deleted successfully', {
      userId: user.id,
      trainingId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Training session deleted successfully',
    });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/admin/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
