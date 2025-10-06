import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reservists/[id]/full
 * Fetch complete reservist data including all fields from profiles and reservist_details
 * Used for populating RIDS Section 1 form
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/reservists/[id]/full' });

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized API access attempt', { context: 'GET /api/staff/reservists/[id]/full' });
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User authenticated', {
      context: 'GET /api/staff/reservists/[id]/full',
      userId: user.id,
      reservistId: id
    });

    // Verify user is staff or above
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('Insufficient permissions', {
        context: 'GET /api/staff/reservists/[id]/full',
        userId: user.id
      });
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    // Fetch complete reservist data
    logger.dbQuery('SELECT', 'accounts + profiles + reservist_details', `Fetching complete data for reservist: ${id.substring(0, 8)}...`);

    const { data, error } = await supabase
      .from('accounts')
      .select(`
        id,
        email,
        status,
        profiles!inner (
          first_name,
          middle_name,
          last_name,
          phone,
          profile_photo_url
        ),
        reservist_details!inner (
          service_number,
          rank,
          company,
          reservist_status,
          date_of_birth,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          commission_type,
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
          bda_size
        )
      `)
      .eq('id', id)
      .eq('role', 'reservist')
      .single();

    if (error) {
      logger.dbError('SELECT', 'accounts', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reservist data' },
        { status: 500 }
      );
    }

    if (!data) {
      logger.warn('Reservist not found', { context: 'GET /api/staff/reservists/[id]/full', id });
      return NextResponse.json(
        { success: false, error: 'Reservist not found' },
        { status: 404 }
      );
    }

    logger.dbSuccess('SELECT', 'accounts');

    // Transform to flat structure
    const flattenedData = {
      id: data.id,
      email: data.email,
      status: data.status,

      // Profile fields
      first_name: data.profiles.first_name,
      middle_name: data.profiles.middle_name,
      last_name: data.profiles.last_name,
      phone: data.profiles.phone,
      profile_photo_url: data.profiles.profile_photo_url,

      // Reservist details - all Section 1 fields
      service_number: data.reservist_details.service_number,
      rank: data.reservist_details.rank,
      company: data.reservist_details.company,
      reservist_status: data.reservist_details.reservist_status,
      date_of_birth: data.reservist_details.date_of_birth,
      address: data.reservist_details.address,
      emergency_contact_name: data.reservist_details.emergency_contact_name,
      emergency_contact_phone: data.reservist_details.emergency_contact_phone,
      commission_type: data.reservist_details.commission_type,
      afpsn: data.reservist_details.afpsn,
      br_svc: data.reservist_details.br_svc,
      mos: data.reservist_details.mos,
      source_of_commission: data.reservist_details.source_of_commission,
      initial_rank: data.reservist_details.initial_rank,
      date_of_commission: data.reservist_details.date_of_commission,
      commission_authority: data.reservist_details.commission_authority,
      mobilization_center: data.reservist_details.mobilization_center,
      designation: data.reservist_details.designation,
      squad_team_section: data.reservist_details.squad_team_section,
      platoon: data.reservist_details.platoon,
      battalion_brigade: data.reservist_details.battalion_brigade,
      combat_shoes_size: data.reservist_details.combat_shoes_size,
      cap_size: data.reservist_details.cap_size,
      bda_size: data.reservist_details.bda_size,
    };

    logger.success('Complete reservist data fetched', {
      context: 'GET /api/staff/reservists/[id]/full',
      reservistId: id
    });
    logger.separator();

    return NextResponse.json({ success: true, data: flattenedData });
  } catch (error) {
    logger.error('Unexpected API error', error, { context: 'GET /api/staff/reservists/[id]/full' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
