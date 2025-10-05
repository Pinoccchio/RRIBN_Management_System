import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { UpdateTrainingInput } from '@/lib/types/training';

/**
 * GET /api/staff/training/[id]
 *
 * Get a single training session by ID
 *
 * Returns: Training session details
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

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to access training details', {
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

    // Fetch training session
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Failed to fetch training session', error, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Verify staff has access to this training's company
    if (data.company && !assignedCompanies.includes(data.company)) {
      logger.warn('Staff attempted to access training from unassigned company', {
        userId: user.id,
        trainingCompany: data.company,
        assignedCompanies,
      });
      return NextResponse.json({ success: false, error: 'Access denied - Company not assigned' }, { status: 403 });
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
    logger.error('Unexpected error in GET /api/staff/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/staff/training/[id]
 *
 * Update a training session
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

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to update training', {
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

    // Fetch existing training session
    const { data: existingTraining, error: fetchError } = await supabase
      .from('training_sessions')
      .select('company')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch training session for update', fetchError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Verify staff has access to this training's company
    if (existingTraining.company && !assignedCompanies.includes(existingTraining.company)) {
      logger.warn('Staff attempted to update training from unassigned company', {
        userId: user.id,
        trainingCompany: existingTraining.company,
        assignedCompanies,
      });
      return NextResponse.json({ success: false, error: 'Access denied - Company not assigned' }, { status: 403 });
    }

    // Parse request body
    const body: UpdateTrainingInput = await request.json();

    // Validate company change (if provided)
    if (body.company && body.company !== existingTraining.company) {
      if (!assignedCompanies.includes(body.company)) {
        logger.warn('Staff attempted to change training to unassigned company', {
          userId: user.id,
          attemptedCompany: body.company,
          assignedCompanies,
        });
        return NextResponse.json(
          { success: false, error: 'Cannot change training to company not assigned to you' },
          { status: 403 }
        );
      }
    }

    // Validate capacity
    if (body.capacity !== undefined && body.capacity !== null && body.capacity <= 0) {
      return NextResponse.json({ success: false, error: 'Capacity must be greater than 0' }, { status: 400 });
    }

    // Validate dates
    if (body.scheduled_date) {
      const scheduledDate = new Date(body.scheduled_date);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid scheduled date' }, { status: 400 });
      }

      if (body.end_date) {
        const endDate = new Date(body.end_date);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json({ success: false, error: 'Invalid end date' }, { status: 400 });
        }
        if (endDate < scheduledDate) {
          return NextResponse.json({ success: false, error: 'End date must be after scheduled date' }, { status: 400 });
        }
      }
    }

    logger.info('Updating training session', {
      userId: user.id,
      trainingId: id,
      updates: Object.keys(body),
    });

    // Update training session
    const { data, error } = await supabase
      .from('training_sessions')
      .update({
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.company !== undefined && { company: body.company || null }),
        ...(body.training_category !== undefined && { training_category: body.training_category }),
        ...(body.scheduled_date !== undefined && { scheduled_date: body.scheduled_date }),
        ...(body.end_date !== undefined && { end_date: body.end_date || null }),
        ...(body.location !== undefined && { location: body.location?.trim() || null }),
        ...(body.capacity !== undefined && { capacity: body.capacity || null }),
        ...(body.prerequisites !== undefined && { prerequisites: body.prerequisites?.trim() || null }),
        ...(body.status !== undefined && { status: body.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update training session', error, { userId: user.id, trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to update training session' }, { status: 500 });
    }

    logger.success('Training session updated successfully', {
      userId: user.id,
      trainingId: id,
      title: data.title,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Unexpected error in PUT /api/staff/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/training/[id]
 *
 * Delete a training session
 *
 * Safety checks:
 * - Cannot delete completed training sessions
 * - Cannot delete training sessions with awarded hours
 * - Can delete scheduled/cancelled sessions with no awarded hours
 * - Deletes associated registrations CASCADE
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

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to delete training', {
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

    // Fetch training session
    const { data: training, error: fetchError } = await supabase
      .from('training_sessions')
      .select('id, title, company, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch training session for deletion', fetchError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Verify staff has access to this training's company
    if (training.company && !assignedCompanies.includes(training.company)) {
      logger.warn('Staff attempted to delete training from unassigned company', {
        userId: user.id,
        trainingCompany: training.company,
        assignedCompanies,
      });
      return NextResponse.json({ success: false, error: 'Access denied - Company not assigned' }, { status: 403 });
    }

    // Safety check: Cannot delete completed training
    if (training.status === 'completed') {
      logger.warn('Attempted to delete completed training', {
        userId: user.id,
        trainingId: id,
        status: training.status,
      });
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed training sessions. These records are required for promotion analytics.' },
        { status: 403 }
      );
    }

    // Safety check: Cannot delete training with awarded hours
    const { data: hoursData, error: hoursError } = await supabase
      .from('training_hours')
      .select('id')
      .eq('training_session_id', id)
      .limit(1);

    if (hoursError) {
      logger.error('Failed to check training hours', hoursError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to verify training hours' }, { status: 500 });
    }

    if (hoursData && hoursData.length > 0) {
      logger.warn('Attempted to delete training with awarded hours', {
        userId: user.id,
        trainingId: id,
      });
      return NextResponse.json(
        { success: false, error: 'Cannot delete training with awarded hours. These records are required for promotion analytics.' },
        { status: 403 }
      );
    }

    logger.info('Deleting training session', {
      userId: user.id,
      trainingId: id,
      title: training.title,
    });

    // Delete associated registrations first (CASCADE)
    const { error: registrationsDeleteError } = await supabase
      .from('training_registrations')
      .delete()
      .eq('training_session_id', id);

    if (registrationsDeleteError) {
      logger.error('Failed to delete training registrations', registrationsDeleteError, { trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to delete training registrations' }, { status: 500 });
    }

    // Delete training session
    const { error: deleteError } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Failed to delete training session', deleteError, { userId: user.id, trainingId: id });
      return NextResponse.json({ success: false, error: 'Failed to delete training session' }, { status: 500 });
    }

    logger.success('Training session deleted successfully', {
      userId: user.id,
      trainingId: id,
      title: training.title,
    });

    return NextResponse.json({ success: true, message: 'Training session deleted successfully' });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/staff/training/[id]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
