import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/dashboard-data' });

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

    // 2. Verify admin role
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (accountError || !account || account.role !== 'admin') {
      logger.warn('Non-admin access attempt', { userId: user.id, role: account?.role });
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Fetch Stats (Battalion-wide, no company filtering)

    // Total companies (active)
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Active staff
    const { count: activeStaff } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'staff')
      .eq('status', 'active');

    // Total reservists (all)
    const { count: totalReservists } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reservist');

    // Active reservists
    const { count: activeReservists } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reservist')
      .eq('status', 'active');

    // Pending documents
    const { count: pendingDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Upcoming trainings
    const { count: upcomingTrainings } = await supabase
      .from('training_sessions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['scheduled', 'ongoing']);

    // Active announcements
    const { count: activeAnnouncements } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 4. Fetch Recent Reservists (top 10)
    const { data: recentReservists, error: reservistsError } = await supabase
      .from('accounts')
      .select(`
        id,
        email,
        status,
        created_at,
        profiles!inner(first_name, last_name, middle_name),
        reservist_details!inner(rank, company, service_number)
      `)
      .eq('role', 'reservist')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reservistsError) {
      logger.error('Error fetching reservists', reservistsError);
    }

    // Transform reservist data to flat structure
    const transformedReservists = (recentReservists || []).map((r: any) => ({
      id: r.id,
      name: `${r.profiles.first_name} ${r.profiles.middle_name ? r.profiles.middle_name + ' ' : ''}${r.profiles.last_name}`,
      rank: r.reservist_details.rank || 'N/A',
      company: r.reservist_details.company || 'Unassigned',
      accountStatus: r.status,
      createdAt: r.created_at,
    }));

    // 5. Fetch Upcoming Training Sessions (top 6)
    const { data: upcomingTraining, error: trainingError } = await supabase
      .from('training_sessions')
      .select('id, title, status, scheduled_date, company')
      .in('status', ['scheduled', 'ongoing'])
      .order('scheduled_date', { ascending: true })
      .limit(6);

    if (trainingError) {
      logger.error('Error fetching training sessions', trainingError);
    }

    // 6. Fetch Pending Documents (top 6)
    const { data: pendingDocs, error: docsError } = await supabase
      .from('documents')
      .select(`
        id,
        document_type,
        created_at,
        status,
        reservist_id,
        accounts!documents_reservist_id_fkey(
          profiles(first_name, last_name, middle_name)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(6);

    if (docsError) {
      logger.error('Error fetching documents', docsError);
    }

    // Transform documents data
    const transformedDocuments = (pendingDocs || []).map((doc: any) => ({
      id: doc.id,
      documentType: doc.document_type,
      reservistName: doc.accounts?.profiles
        ? `${doc.accounts.profiles.first_name} ${doc.accounts.profiles.middle_name ? doc.accounts.profiles.middle_name + ' ' : ''}${doc.accounts.profiles.last_name}`
        : 'Unknown',
      createdAt: doc.created_at,
      status: doc.status,
    }));

    // 7. Fetch Recent Announcements (top 6, active only)
    const { data: recentAnnouncements, error: announcementsError } = await supabase
      .from('announcements')
      .select('id, title, priority, content, published_at, is_active')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(6);

    if (announcementsError) {
      logger.error('Error fetching announcements', announcementsError);
    }

    const stats = {
      totalCompanies: totalCompanies || 0,
      activeStaff: activeStaff || 0,
      totalReservists: totalReservists || 0,
      activeReservists: activeReservists || 0,
      pendingDocuments: pendingDocuments || 0,
      upcomingTrainings: upcomingTrainings || 0,
      activeAnnouncements: activeAnnouncements || 0,
    };

    const dashboardData = {
      stats,
      recentReservists: transformedReservists,
      upcomingTraining: upcomingTraining || [],
      pendingDocuments: transformedDocuments,
      recentAnnouncements: recentAnnouncements || [],
    };

    logger.success('Admin dashboard data fetched successfully', {
      context: 'GET /api/admin/dashboard-data',
      stats,
      counts: {
        reservists: transformedReservists.length,
        training: (upcomingTraining || []).length,
        documents: transformedDocuments.length,
        announcements: (recentAnnouncements || []).length,
      },
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
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
