import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { MarkAttendanceInput } from '@/lib/types/training';

/**
 * POST /api/staff/training/[id]/attendance
 *
 * Mark attendance for reservists in a training session
 *
 * Body: MarkAttendanceInput { reservist_ids: string[] }
 *
 * Returns: Updated registrations with attendance marked
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: trainingId } = await params;

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Unauthorized access attempt to mark attendance', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to mark attendance', {
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
    const { data: training, error: trainingError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', trainingId)
      .single();

    if (trainingError || !training) {
      logger.error('Training session not found', trainingError, { userId: user.id, trainingId });
      return NextResponse.json({ success: false, error: 'Training session not found' }, { status: 404 });
    }

    // Check if training belongs to assigned company
    if (training.company && !assignedCompanies.includes(training.company)) {
      logger.warn('Staff attempted to mark attendance for training from unassigned company', {
        userId: user.id,
        trainingId,
        trainingCompany: training.company,
        assignedCompanies,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Training not in your assigned companies' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: MarkAttendanceInput = await request.json();

    if (!body.reservist_ids || !Array.isArray(body.reservist_ids)) {
      return NextResponse.json({ success: false, error: 'Invalid input: reservist_ids must be an array' }, { status: 400 });
    }

    if (body.reservist_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No reservists provided' }, { status: 400 });
    }

    logger.info('Marking attendance for training session', {
      userId: user.id,
      trainingId,
      reservistCount: body.reservist_ids.length,
    });

    // Fetch all registrations for this training
    const { data: allRegistrations, error: regError } = await supabase
      .from('training_registrations')
      .select('id, reservist_id, status')
      .eq('training_session_id', trainingId);

    if (regError) {
      logger.error('Failed to fetch registrations', regError, { userId: user.id, trainingId });
      return NextResponse.json({ success: false, error: 'Failed to fetch registrations' }, { status: 500 });
    }

    if (!allRegistrations || allRegistrations.length === 0) {
      logger.warn('No registrations found for training', { userId: user.id, trainingId });
      return NextResponse.json({ success: false, error: 'No registrations found for this training' }, { status: 404 });
    }

    // Verify all reservist_ids exist in registrations
    const registrationMap = new Map(allRegistrations.map((r) => [r.reservist_id, r]));
    const invalidIds = body.reservist_ids.filter((id) => !registrationMap.has(id));

    if (invalidIds.length > 0) {
      logger.warn('Invalid reservist IDs provided for attendance', {
        userId: user.id,
        trainingId,
        invalidIds,
      });
      return NextResponse.json(
        { success: false, error: `Invalid reservist IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updatedRegistrations = [];

    // Mark attendance for specified reservists
    for (const reservistId of body.reservist_ids) {
      const registration = registrationMap.get(reservistId);
      if (!registration) continue;

      // Only update if not already attended or completed
      if (registration.status === 'registered' || registration.status === 'no_show') {
        const { data, error } = await supabase
          .from('training_registrations')
          .update({
            status: 'attended',
            attended_at: now,
            updated_at: now,
          })
          .eq('id', registration.id)
          .select()
          .single();

        if (error) {
          logger.error('Failed to mark attendance for reservist', error, {
            userId: user.id,
            trainingId,
            reservistId,
          });
        } else {
          updatedRegistrations.push(data);
        }
      }
    }

    // Mark no-show for reservists not in the attendance list
    const attendedIds = new Set(body.reservist_ids);
    const noShowRegistrations = allRegistrations.filter(
      (r) => !attendedIds.has(r.reservist_id) && (r.status === 'registered' || r.status === 'attended')
    );

    for (const registration of noShowRegistrations) {
      const { error } = await supabase
        .from('training_registrations')
        .update({
          status: 'no_show',
          updated_at: now,
        })
        .eq('id', registration.id);

      if (error) {
        logger.error('Failed to mark no-show for reservist', error, {
          userId: user.id,
          trainingId,
          reservistId: registration.reservist_id,
        });
      }
    }

    // Update training status to ongoing if it's still scheduled
    if (training.status === 'scheduled') {
      await supabase
        .from('training_sessions')
        .update({ status: 'ongoing', updated_at: now })
        .eq('id', trainingId);
    }

    logger.success('Attendance marked successfully', {
      userId: user.id,
      trainingId,
      attendedCount: updatedRegistrations.length,
      noShowCount: noShowRegistrations.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        marked_count: updatedRegistrations.length,
        registrations: updatedRegistrations,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/staff/training/[id]/attendance', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
