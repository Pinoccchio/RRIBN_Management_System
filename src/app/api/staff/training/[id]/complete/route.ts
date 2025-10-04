import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { CompleteTrainingInput } from '@/lib/types/training';

/**
 * POST /api/staff/training/[id]/complete
 *
 * Award training hours and complete a training session
 *
 * CRITICAL ENDPOINT: Records training hours as data for future promotion analysis.
 *
 * IMPORTANT: This does NOT promote anyone. It only collects data (training_hours records)
 * that will be used by Administrator's Prescriptive Analytics to suggest promotion candidates.
 *
 * Staff Role: DATA COLLECTION ONLY
 * Administrator Role: PROMOTION DECISION MAKING (uses this data in analytics)
 *
 * Body: CompleteTrainingInput {
 *   awards: Array<{
 *     reservist_id: string,
 *     hours_completed: number,
 *     completion_status: 'passed' | 'failed' | 'pending',
 *     certificate_url?: string,
 *     notes?: string
 *   }>,
 *   training_category?: 'Leadership' | 'Combat' | 'Technical' | 'Seminar' | 'Other'
 * }
 *
 * Returns: Training session, awarded hours, and notification count
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
      logger.error('Unauthorized access attempt to complete training', authError);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is staff
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account?.role !== 'staff') {
      logger.error('Non-staff user attempted to complete training', {
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
      logger.warn('Staff attempted to complete training from unassigned company', {
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
    const body: CompleteTrainingInput = await request.json();

    // Validate input
    if (!body.awards || !Array.isArray(body.awards) || body.awards.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid input: awards must be a non-empty array' }, { status: 400 });
    }

    // Validate each award
    for (const award of body.awards) {
      if (!award.reservist_id) {
        return NextResponse.json({ success: false, error: 'Missing reservist_id in award' }, { status: 400 });
      }
      if (typeof award.hours_completed !== 'number' || award.hours_completed <= 0) {
        return NextResponse.json({ success: false, error: 'hours_completed must be a positive number' }, { status: 400 });
      }
      if (award.hours_completed > 720) {
        // Max 720 hours (30 days * 24 hours) for safety
        return NextResponse.json({ success: false, error: 'hours_completed cannot exceed 720 hours' }, { status: 400 });
      }
      if (!['passed', 'failed', 'pending'].includes(award.completion_status)) {
        return NextResponse.json({ success: false, error: 'Invalid completion_status' }, { status: 400 });
      }
    }

    logger.info('Completing training and awarding hours', {
      userId: user.id,
      trainingId,
      awardCount: body.awards.length,
      category: body.training_category,
    });

    // Fetch all registrations to verify reservists
    const { data: registrations, error: regError } = await supabase
      .from('training_registrations')
      .select('id, reservist_id, status')
      .eq('training_session_id', trainingId)
      .in(
        'reservist_id',
        body.awards.map((a) => a.reservist_id)
      );

    if (regError) {
      logger.error('Failed to fetch registrations', regError, { userId: user.id, trainingId });
      return NextResponse.json({ success: false, error: 'Failed to fetch registrations' }, { status: 500 });
    }

    const registrationMap = new Map(registrations?.map((r) => [r.reservist_id, r]) || []);

    // Verify all reservists are registered
    const missingReservists = body.awards.filter((a) => !registrationMap.has(a.reservist_id));
    if (missingReservists.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Reservists not registered for this training: ${missingReservists.map((a) => a.reservist_id).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const awardedHours = [];
    const notifications = [];

    // Process each award
    for (const award of body.awards) {
      const registration = registrationMap.get(award.reservist_id);
      if (!registration) continue;

      // Update training_registration with completion status
      const { error: updateRegError } = await supabase
        .from('training_registrations')
        .update({
          status: 'completed',
          completion_status: award.completion_status,
          certificate_url: award.certificate_url || null,
          notes: award.notes || null,
          updated_at: now,
        })
        .eq('id', registration.id);

      if (updateRegError) {
        logger.error('Failed to update registration', updateRegError, {
          userId: user.id,
          trainingId,
          reservistId: award.reservist_id,
        });
        continue;
      }

      // Create training_hours record (CRITICAL for promotions)
      const { data: trainingHours, error: hoursError } = await supabase
        .from('training_hours')
        .insert({
          reservist_id: award.reservist_id,
          training_session_id: trainingId,
          training_name: training.title,
          training_category: body.training_category || 'Other',
          hours_completed: award.hours_completed,
          completion_date: todayDate,
          certificate_url: award.certificate_url || null,
          notes: award.notes || null,
        })
        .select()
        .single();

      if (hoursError) {
        logger.error('Failed to create training_hours record', hoursError, {
          userId: user.id,
          trainingId,
          reservistId: award.reservist_id,
        });
        continue;
      }

      awardedHours.push(trainingHours);

      // Create notification for reservist
      const notificationTitle =
        award.completion_status === 'passed'
          ? 'Training Completed - Passed'
          : award.completion_status === 'failed'
            ? 'Training Completed - Failed'
            : 'Training Completed - Pending Review';

      const notificationMessage =
        award.completion_status === 'passed'
          ? `Congratulations! You have successfully completed "${training.title}" and earned ${award.hours_completed} training hours.`
          : award.completion_status === 'failed'
            ? `You did not pass "${training.title}". Please review the requirements and consider retaking the training.`
            : `Your completion of "${training.title}" is pending review. You will be notified of the final result.`;

      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: award.reservist_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'training',
          reference_id: trainingId,
          reference_table: 'training_sessions',
        })
        .select()
        .single();

      if (notifError) {
        logger.error('Failed to create notification', notifError, {
          userId: user.id,
          trainingId,
          reservistId: award.reservist_id,
        });
      } else {
        notifications.push(notification);
      }
    }

    // Update training session status to completed
    const { data: updatedTraining, error: updateTrainingError } = await supabase
      .from('training_sessions')
      .update({
        status: 'completed',
        updated_at: now,
      })
      .eq('id', trainingId)
      .select()
      .single();

    if (updateTrainingError) {
      logger.error('Failed to update training status', updateTrainingError, {
        userId: user.id,
        trainingId,
      });
    }

    logger.success('Training completed and hours awarded successfully', {
      userId: user.id,
      trainingId,
      hoursAwarded: awardedHours.length,
      notificationsSent: notifications.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        training_session: updatedTraining || training,
        hours_awarded: awardedHours,
        notifications_sent: notifications.length,
      },
    });
  } catch (error) {
    logger.error('Unexpected error in POST /api/staff/training/[id]/complete', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
