import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/rids
 * List RIDS forms with filters
 * COMPANY-FILTERED: Only shows RIDS from reservists in assigned companies
 *
 * Query params:
 * - status: filter by status (draft, submitted, approved, rejected, all)
 * - company: filter by company code (must be in assigned companies)
 * - search: search by reservist name or service number
 * - page: page number (default: 1)
 * - limit: items per page (default: 10)
 */
export async function GET(request: NextRequest) {
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

    // Get staff's assigned companies
    const { data: staffDetails, error: staffError } = await supabase
      .from('staff_details')
      .select('assigned_companies')
      .eq('id', user.id)
      .single();

    if (staffError || !staffDetails) {
      logger.error('Failed to fetch staff details', staffError, { userId: user.id });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch staff details' },
        { status: 500 }
      );
    }

    const assignedCompanies = staffDetails.assigned_companies || [];

    if (assignedCompanies.length === 0) {
      logger.info('No assigned companies - Returning empty list', { userId: user.id });
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const company = searchParams.get('company');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Validate company filter if provided - must be in assigned companies
    if (company && !assignedCompanies.includes(company)) {
      logger.warn('Staff attempted to filter by unassigned company', {
        userId: user.id,
        attemptedCompany: company,
        assignedCompanies,
      });
      return NextResponse.json(
        { success: false, error: 'You can only view RIDS from companies you are assigned to' },
        { status: 403 }
      );
    }

    logger.info('Fetching RIDS list', {
      context: 'GET /api/staff/rids',
      user_id: user.id,
      filters: { status, company, search, page, limit },
      assignedCompanies,
    });

    // Build query
    let query = supabase
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
            reservist_status
          )
        ),
        submitter:accounts!submitted_by(
          profiles(first_name, last_name)
        ),
        approver:accounts!approved_by(
          profiles(first_name, last_name)
        )
      `, { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply company filter (already validated to be in assigned companies)
    if (company) {
      query = query.eq('reservist.reservist_details.company', company);
    }

    // Apply search filter (search in reservist name or service number)
    if (search) {
      query = query.or(`
        reservist.profiles.first_name.ilike.%${search}%,
        reservist.profiles.last_name.ilike.%${search}%,
        reservist.reservist_details.service_number.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch RIDS list', error, {
        context: 'GET /api/staff/rids',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Filter RIDS by assigned companies (application-level security)
    // Only show RIDS from reservists in staff's assigned companies
    const filteredData = (data || []).filter((rids: any) => {
      const reservistCompany = rids.reservist?.reservist_details?.company;
      return reservistCompany && assignedCompanies.includes(reservistCompany);
    });

    logger.info(`Filtered RIDS: ${data?.length || 0} total → ${filteredData.length} for staff's companies`, {
      userId: user.id,
      assignedCompanies,
    });

    // Transform data to match expected format
    const transformedData = filteredData.map((rids: any) => ({
      id: rids.id,
      reservist_id: rids.reservist_id,
      version: rids.version,
      status: rids.status,
      created_at: rids.created_at,
      updated_at: rids.updated_at,
      submitted_at: rids.submitted_at,
      approved_at: rids.approved_at,
      rejection_reason: rids.rejection_reason,

      // Section 2 fields
      present_occupation: rids.present_occupation,
      company_name: rids.company_name,
      company_address: rids.company_address,
      office_tel_nr: rids.office_tel_nr,
      home_address_street: rids.home_address_street,
      home_address_city: rids.home_address_city,
      home_address_province: rids.home_address_province,
      home_address_zip: rids.home_address_zip,
      res_tel_nr: rids.res_tel_nr,
      mobile_tel_nr: rids.mobile_tel_nr,
      birth_place: rids.birth_place,
      religion: rids.religion,
      height_cm: rids.height_cm,
      weight_kg: rids.weight_kg,
      marital_status: rids.marital_status,
      sex: rids.sex,
      fb_account: rids.fb_account,
      special_skills: rids.special_skills,
      languages_spoken: rids.languages_spoken,

      // Section 11 fields
      photo_url: rids.photo_url,
      thumbmark_url: rids.thumbmark_url,
      signature_url: rids.signature_url,

      // Joined data
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
      } : null,
      submitter: rids.submitter?.profiles ? {
        first_name: rids.submitter.profiles.first_name,
        last_name: rids.submitter.profiles.last_name,
      } : null,
      approver: rids.approver?.profiles ? {
        first_name: rids.approver.profiles.first_name,
        last_name: rids.approver.profiles.last_name,
      } : null,
    }));

    logger.success('RIDS list fetched successfully', {
      context: 'GET /api/staff/rids',
      count: transformedData.length,
      total: filteredData.length,
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    });
  } catch (error) {
    logger.error('Unexpected error fetching RIDS list', error, {
      context: 'GET /api/staff/rids',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/rids
 * Create new RIDS (draft status)
 *
 * Body:
 * - reservist_id: UUID of reservist
 * - Section 2 fields (optional)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { reservist_id, ...sectionData } = body;

    if (!reservist_id) {
      return NextResponse.json(
        { success: false, error: 'reservist_id is required' },
        { status: 400 }
      );
    }

    logger.info('Creating new RIDS', {
      context: 'POST /api/staff/rids',
      user_id: user.id,
      reservist_id,
    });

    // Check if RIDS already exists for this reservist
    const { data: existing, error: checkError } = await supabase
      .from('rids_forms')
      .select('id')
      .eq('reservist_id', reservist_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'RIDS already exists for this reservist' },
        { status: 409 }
      );
    }

    // Create new RIDS
    const { data, error } = await supabase
      .from('rids_forms')
      .insert({
        reservist_id,
        status: 'draft',
        version: 1,
        ...sectionData,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create RIDS', error, {
        context: 'POST /api/staff/rids',
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('RIDS created successfully', {
      context: 'POST /api/staff/rids',
      rids_id: data.id,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'RIDS created successfully',
    });
  } catch (error) {
    logger.error('Unexpected error creating RIDS', error, {
      context: 'POST /api/staff/rids',
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
