import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * PUT /api/staff/reservists/[id]/details
 * Update reservist_details fields (Section 1 RIDS data)
 * Allows staff to update personnel information during RIDS creation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logger.separator();
  logger.info('API Request', { context: 'PUT /api/staff/reservists/[id]/details' });

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'PUT /api/staff/reservists/[id]/details' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'PUT /api/staff/reservists/[id]/details',
      userId: user.id,
      reservistId: id
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions', {
        context: 'PUT /api/staff/reservists/[id]/details',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    const body = await request.json();

    // Extract updatable Section 1 fields
    const {
      afpsn,
      br_svc,
      mos,
      source_of_commission,
      initial_rank,
      date_of_commission,
      commission_authority,
      mobilization_center,
      designation,
      squad_team_section,
      platoon,
      battalion_brigade,
      combat_shoes_size,
      cap_size,
      bda_size,
    } = body;

    // Build update object (only include provided fields)
    const updateData: Record<string, any> = {};

    if (afpsn !== undefined) updateData.afpsn = afpsn;
    if (br_svc !== undefined) updateData.br_svc = br_svc;
    if (mos !== undefined) updateData.mos = mos;
    if (source_of_commission !== undefined) updateData.source_of_commission = source_of_commission;
    if (initial_rank !== undefined) updateData.initial_rank = initial_rank;
    if (date_of_commission !== undefined) updateData.date_of_commission = date_of_commission;
    if (commission_authority !== undefined) updateData.commission_authority = commission_authority;
    if (mobilization_center !== undefined) updateData.mobilization_center = mobilization_center;
    if (designation !== undefined) updateData.designation = designation;
    if (squad_team_section !== undefined) updateData.squad_team_section = squad_team_section;
    if (platoon !== undefined) updateData.platoon = platoon;
    if (battalion_brigade !== undefined) updateData.battalion_brigade = battalion_brigade;
    if (combat_shoes_size !== undefined) updateData.combat_shoes_size = combat_shoes_size;
    if (cap_size !== undefined) updateData.cap_size = cap_size;
    if (bda_size !== undefined) updateData.bda_size = bda_size;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 1) {
      // Only updated_at, no actual changes
      return NextResponse.json({
        success: true,
        message: 'No changes to update'
      });
    }

    logger.dbQuery('UPDATE', 'reservist_details', `Updating reservist details for: ${id.substring(0, 8)}...`);
    logger.debug('Update fields', { context: 'PUT /api/staff/reservists/[id]/details', fields: Object.keys(updateData) });

    // Update reservist_details
    const { data, error } = await supabase
      .from('reservist_details')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.dbError('UPDATE', 'reservist_details', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update reservist details' },
        { status: 500 }
      );
    }

    if (!data) {
      logger.warn('Reservist details not found', { context: 'PUT /api/staff/reservists/[id]/details', id });
      return NextResponse.json(
        { success: false, error: 'Reservist not found' },
        { status: 404 }
      );
    }

    logger.dbSuccess('UPDATE', 'reservist_details');
    logger.success('Reservist details updated successfully', {
      context: 'PUT /api/staff/reservists/[id]/details',
      reservistId: id
    });
    logger.separator();

    return NextResponse.json({
      success: true,
      data,
      message: 'Reservist details updated successfully'
    });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'PUT /api/staff/reservists/[id]/details' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
