import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Reservist, ReservistViewData } from '@/lib/types/reservist';

/**
 * GET /api/staff/reservists/[id]
 * Get single reservist details (must be in staff's assigned companies)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `GET /api/staff/reservists/${params.id}` });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      return NextResponse.json({ success: false, error: 'No assigned companies' }, { status: 403 });
    }

    const assignedCompanies = staffDetails.assigned_companies;

    // Fetch reservist details
    logger.dbQuery('SELECT', 'reservist_accounts_with_details', `Fetching reservist: ${params.id}`);
    const { data, error } = await supabase
      .from('reservist_accounts_with_details')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      logger.dbError('SELECT', 'reservist_accounts_with_details', error);
      return NextResponse.json({ success: false, error: 'Reservist not found' }, { status: 404 });
    }

    // Check if reservist is in assigned companies
    if (!data.company || !assignedCompanies.includes(data.company)) {
      logger.warn(`Access denied - Reservist not in assigned companies`, {
        reservistCompany: data.company,
        assignedCompanies
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Reservist not in your assigned companies' }, { status: 403 });
    }

    logger.dbSuccess('SELECT', 'reservist_accounts_with_details');

    // Transform to nested structure
    const res: ReservistViewData = data;
    const reservist: Reservist = {
      id: res.id,
      email: res.email,
      role: 'reservist' as const,
      status: res.status as 'pending' | 'active' | 'inactive' | 'deactivated',
      created_at: res.created_at,
      updated_at: res.updated_at,
      created_by: res.created_by,
      approved_by: res.approved_by,
      approved_at: res.approved_at,
      last_login_at: res.last_login_at,
      rejection_reason: res.rejection_reason,
      profile: {
        first_name: res.first_name,
        middle_name: res.middle_name,
        last_name: res.last_name,
        phone: res.phone,
        profile_photo_url: res.profile_photo_url,
      },
      reservist_details: {
        id: res.id,
        service_number: res.service_number,
        afpsn: res.afpsn,
        rank: res.rank,
        company: res.company,
        commission_type: res.commission_type as any,
        date_of_birth: res.date_of_birth,
        address: res.address,
        emergency_contact_name: res.emergency_contact_name,
        emergency_contact_phone: res.emergency_contact_phone,
        reservist_status: res.reservist_status as any,
        br_svc: res.br_svc,
        mos: res.mos,
        source_of_commission: res.source_of_commission,
        initial_rank: res.initial_rank,
        date_of_commission: res.date_of_commission,
        commission_authority: null,
        mobilization_center: null,
        designation: null,
        squad_team_section: null,
        platoon: null,
        battalion_brigade: null,
        combat_shoes_size: null,
        cap_size: null,
        bda_size: null,
        created_at: res.created_at,
        updated_at: res.updated_at,
      },
      approver: res.approver_first_name && res.approver_last_name ? {
        first_name: res.approver_first_name,
        last_name: res.approver_last_name,
      } : null,
    };

    logger.success(`Fetched reservist details: ${res.first_name} ${res.last_name}`);
    logger.separator();

    return NextResponse.json({ success: true, data: reservist });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/staff/reservists/[id]
 * Update reservist information (profile, reservist_details)
 * Staff can update reservists in their assigned companies
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  logger.separator();
  logger.info('API Request', { context: `PUT /api/staff/reservists/${params.id}` });

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    // Get staff's assigned companies
    const { data: staffDetails } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (!staffDetails || !staffDetails.assigned_companies || staffDetails.assigned_companies.length === 0) {
      return NextResponse.json({ success: false, error: 'No assigned companies' }, { status: 403 });
    }

    const assignedCompanies = staffDetails.assigned_companies;

    // Check if reservist exists and is in assigned companies
    const { data: existingReservist } = await supabase
      .from('reservist_details')
      .select('company')
      .eq('id', params.id)
      .single();

    if (!existingReservist || !existingReservist.company || !assignedCompanies.includes(existingReservist.company)) {
      return NextResponse.json({ success: false, error: 'Forbidden - Reservist not in your assigned companies' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { profile, reservist_details } = body;

    // Update profile if provided
    if (profile) {
      logger.dbQuery('UPDATE', 'profiles', `Updating profile for reservist: ${params.id}`);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })
        .eq('id', params.id);

      if (profileError) {
        logger.dbError('UPDATE', 'profiles', profileError);
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
      }
      logger.dbSuccess('UPDATE', 'profiles');
    }

    // Update reservist_details if provided
    if (reservist_details) {
      logger.dbQuery('UPDATE', 'reservist_details', `Updating reservist details for: ${params.id}`);

      const updateData: any = {};

      // Only update allowed fields for staff
      if (reservist_details.rank) updateData.rank = reservist_details.rank;
      if (reservist_details.company && assignedCompanies.includes(reservist_details.company)) {
        updateData.company = reservist_details.company;
      }
      if (reservist_details.reservist_status) updateData.reservist_status = reservist_details.reservist_status;
      if (reservist_details.address) updateData.address = reservist_details.address;
      if (reservist_details.emergency_contact_name) updateData.emergency_contact_name = reservist_details.emergency_contact_name;
      if (reservist_details.emergency_contact_phone) updateData.emergency_contact_phone = reservist_details.emergency_contact_phone;
      if (reservist_details.mos) updateData.mos = reservist_details.mos;

      const { error: detailsError } = await supabase
        .from('reservist_details')
        .update(updateData)
        .eq('id', params.id);

      if (detailsError) {
        logger.dbError('UPDATE', 'reservist_details', detailsError);
        return NextResponse.json({ success: false, error: 'Failed to update reservist details' }, { status: 500 });
      }
      logger.dbSuccess('UPDATE', 'reservist_details');
    }

    logger.success(`Successfully updated reservist: ${params.id}`);
    logger.separator();

    return NextResponse.json({ success: true, message: 'Reservist updated successfully' });
  } catch (error) {
    logger.error('Unexpected API error', error);
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
