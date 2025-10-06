import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/staff/dashboard-stats' });

  try {
    const supabase = await createClient();

    // 1. Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access attempt', { error: authError });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get staff details and assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies, position')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Staff details not found', staffError);
      return NextResponse.json(
        { success: false, error: 'Staff details not found' },
        { status: 404 }
      );
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    if (assignedCompanies.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalReservists: 0,
          activeReservists: 0,
          pendingDocuments: 0,
          upcomingTrainings: 0,
          urgentAnnouncements: 0,
          pendingActions: 0,
        },
      });
    }

    // 3. Get total reservists in assigned companies
    const { count: totalReservists } = await supabase
      .from('accounts')
      .select('*, reservist_details!inner(company)', { count: 'exact', head: true })
      .eq('role', 'reservist')
      .in('reservist_details.company', assignedCompanies);

    // 4. Get active reservists
    const { count: activeReservists } = await supabase
      .from('accounts')
      .select('*, reservist_details!inner(company)', { count: 'exact', head: true })
      .eq('role', 'reservist')
      .eq('status', 'active')
      .in('reservist_details.company', assignedCompanies);

    // 5. Get pending documents count
    // First, get reservist IDs from assigned companies
    const { data: reservistIds } = await supabase
      .from('reservist_details')
      .select('id')
      .in('company', assignedCompanies);

    const reservistIdList = (reservistIds || []).map((r) => r.id);

    // Then count documents for those reservists
    const { count: pendingDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('reservist_id', reservistIdList);

    // 6. Get upcoming training sessions
    const { count: upcomingTrainings } = await supabase
      .from('training_sessions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['scheduled', 'ongoing'])
      .or(`company.in.(${assignedCompanies.join(',')}),company.is.null`);

    // 7. Get urgent announcements
    const { count: urgentAnnouncements } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('priority', 'urgent')
      .or(
        `target_companies.is.null,target_companies.cs.{${assignedCompanies.join(',')}}`
      );

    // 8. Get pending actions (pending account status)
    const { count: pendingActions } = await supabase
      .from('accounts')
      .select('*, reservist_details!inner(company)', { count: 'exact', head: true })
      .eq('role', 'reservist')
      .eq('status', 'pending')
      .in('reservist_details.company', assignedCompanies);

    const stats = {
      totalReservists: totalReservists || 0,
      activeReservists: activeReservists || 0,
      pendingDocuments: pendingDocuments || 0,
      upcomingTrainings: upcomingTrainings || 0,
      urgentAnnouncements: urgentAnnouncements || 0,
      pendingActions: pendingActions || 0,
    };

    logger.success('Staff dashboard statistics fetched successfully', {
      context: 'GET /api/staff/dashboard-stats',
      assignedCompanies,
      stats,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Unexpected API error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
