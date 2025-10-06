import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/rids/[id]
 * Get single RIDS with all sections
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ridsId = params.id;

    logger.info('Fetching RIDS details', {
      context: 'GET /api/staff/rids/[id]',
      user_id: user.id,
      rids_id: ridsId,
    });

    // Fetch main RIDS data
    const { data: rids, error: ridsError } = await supabase
      .from('rids_forms')
      .select(`
        *,
        reservist:accounts!reservist_id(
          id,
          email,
          profiles!inner(first_name, middle_name, last_name),
          reservist_details!inner(
            service_number,
            rank,
            company,
            reservist_status,
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
            date_of_birth,
            address
          )
        )
      `)
      .eq('id', ridsId)
      .single();

    if (ridsError) {
      logger.error('Failed to fetch RIDS', ridsError, {
        context: 'GET /api/staff/rids/[id]',
      });
      return NextResponse.json(
        { success: false, error: ridsError.message },
        { status: ridsError.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // Fetch all section data in parallel
    const [
      promotionHistory,
      militaryTraining,
      awards,
      dependents,
      education,
      activeDuty,
      unitAssignments,
      designations,
    ] = await Promise.all([
      supabase
        .from('rids_promotion_history')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('entry_number', { ascending: true }),
      supabase
        .from('rids_military_training')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_graduated', { ascending: false }),
      supabase
        .from('rids_awards')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_awarded', { ascending: false }),
      supabase
        .from('rids_dependents')
        .select('*')
        .eq('rids_form_id', ridsId),
      supabase
        .from('rids_education')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_graduated', { ascending: false }),
      supabase
        .from('rids_active_duty')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_start', { ascending: false }),
      supabase
        .from('rids_unit_assignments')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_from', { ascending: false }),
      supabase
        .from('rids_designations')
        .select('*')
        .eq('rids_form_id', ridsId)
        .order('date_from', { ascending: false }),
    ]);

    // Combine all data
    const completeRIDS = {
      ...rids,
      reservist: rids.reservist ? {
        id: rids.reservist.id,
        email: rids.reservist.email,
        first_name: rids.reservist.profiles?.first_name,
        middle_name: rids.reservist.profiles?.middle_name,
        last_name: rids.reservist.profiles?.last_name,
        service_number: rids.reservist.reservist_details?.service_number,
        rank: rids.reservist.reservist_details?.rank,
        company: rids.reservist.reservist_details?.company,
        reservist_status: rids.reservist.reservist_details?.reservist_status,
        afpsn: rids.reservist.reservist_details?.afpsn,
        br_svc: rids.reservist.reservist_details?.br_svc,
        mos: rids.reservist.reservist_details?.mos,
        source_of_commission: rids.reservist.reservist_details?.source_of_commission,
        initial_rank: rids.reservist.reservist_details?.initial_rank,
        date_of_commission: rids.reservist.reservist_details?.date_of_commission,
        commission_authority: rids.reservist.reservist_details?.commission_authority,
        mobilization_center: rids.reservist.reservist_details?.mobilization_center,
        designation: rids.reservist.reservist_details?.designation,
        squad_team_section: rids.reservist.reservist_details?.squad_team_section,
        platoon: rids.reservist.reservist_details?.platoon,
        battalion_brigade: rids.reservist.reservist_details?.battalion_brigade,
        combat_shoes_size: rids.reservist.reservist_details?.combat_shoes_size,
        cap_size: rids.reservist.reservist_details?.cap_size,
        bda_size: rids.reservist.reservist_details?.bda_size,
        date_of_birth: rids.reservist.reservist_details?.date_of_birth,
        address: rids.reservist.reservist_details?.address,
      } : null,
      promotion_history: promotionHistory.data || [],
      military_training: militaryTraining.data || [],
      awards: awards.data || [],
      dependents: dependents.data || [],
      education: education.data || [],
      active_duty: activeDuty.data || [],
      unit_assignments: unitAssignments.data || [],
      designations: designations.data || [],
    };

    logger.success('RIDS fetched successfully', {
      context: 'GET /api/staff/rids/[id]',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      data: completeRIDS,
    });
  } catch (error) {
    logger.error('Unexpected error fetching RIDS', error, {
      context: 'GET /api/staff/rids/[id]',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/staff/rids/[id]
 * Update RIDS (draft only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ridsId = params.id;
    const body = await request.json();

    logger.info('Updating RIDS', {
      context: 'PUT /api/staff/rids/[id]',
      user_id: user.id,
      rids_id: ridsId,
    });

    // Update RIDS (only Section 2 fields and Section 11 biometrics)
    const { data, error } = await supabase
      .from('rids_forms')
      .update({
        // Section 2 fields
        present_occupation: body.present_occupation,
        company_name: body.company_name,
        company_address: body.company_address,
        office_tel_nr: body.office_tel_nr,
        home_address_street: body.home_address_street,
        home_address_city: body.home_address_city,
        home_address_province: body.home_address_province,
        home_address_zip: body.home_address_zip,
        res_tel_nr: body.res_tel_nr,
        mobile_tel_nr: body.mobile_tel_nr,
        birth_place: body.birth_place,
        religion: body.religion,
        height_cm: body.height_cm,
        weight_kg: body.weight_kg,
        marital_status: body.marital_status,
        sex: body.sex,
        fb_account: body.fb_account,
        special_skills: body.special_skills,
        languages_spoken: body.languages_spoken,

        // Section 11 biometrics
        photo_url: body.photo_url,
        thumbmark_url: body.thumbmark_url,
        signature_url: body.signature_url,

        updated_at: new Date().toISOString(),
      })
      .eq('id', ridsId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update RIDS', error, {
        context: 'PUT /api/staff/rids/[id]',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('RIDS updated successfully', {
      context: 'PUT /api/staff/rids/[id]',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'RIDS updated successfully',
    });
  } catch (error) {
    logger.error('Unexpected error updating RIDS', error, {
      context: 'PUT /api/staff/rids/[id]',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/staff/rids/[id]
 * Delete RIDS (draft only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ridsId = params.id;

    logger.info('Deleting RIDS', {
      context: 'DELETE /api/staff/rids/[id]',
      user_id: user.id,
      rids_id: ridsId,
    });

    // Check if RIDS exists and is draft
    const { data: rids, error: fetchError } = await supabase
      .from('rids_forms')
      .select('status')
      .eq('id', ridsId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'RIDS not found' },
        { status: 404 }
      );
    }

    if (rids.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Can only delete draft RIDS' },
        { status: 403 }
      );
    }

    // Delete RIDS (CASCADE will delete all section data)
    const { error } = await supabase
      .from('rids_forms')
      .delete()
      .eq('id', ridsId);

    if (error) {
      logger.error('Failed to delete RIDS', error, {
        context: 'DELETE /api/staff/rids/[id]',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('RIDS deleted successfully', {
      context: 'DELETE /api/staff/rids/[id]',
      rids_id: ridsId,
    });

    return NextResponse.json({
      success: true,
      message: 'RIDS deleted successfully',
    });
  } catch (error) {
    logger.error('Unexpected error deleting RIDS', error, {
      context: 'DELETE /api/staff/rids/[id]',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
