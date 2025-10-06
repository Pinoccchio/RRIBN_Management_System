import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/reservists/simple
 * Simplified endpoint for reservist selection in RIDS creation
 * Returns flat structure with only essential fields for display
 */
export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('🚀 API Request Started', { context: 'GET /api/staff/reservists/simple' });

  try {
    logger.debug('Creating Supabase client...', { context: 'GET /api/staff/reservists/simple' });
    const supabase = await createClient();
    logger.debug('✅ Supabase client created', { context: 'GET /api/staff/reservists/simple' });

    // Check if user is authenticated
    logger.debug('Checking authentication...', { context: 'GET /api/staff/reservists/simple' });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('❌ Unauthorized API access attempt', { context: 'GET /api/staff/reservists/simple' });
      logger.separator();
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('✅ User authenticated', {
      context: 'GET /api/staff/reservists/simple',
      userId: user.id,
      email: user.email || undefined
    });
    logger.debug(`   Auth UID: ${user.id}`, { context: 'GET /api/staff/reservists/simple' });

    // Verify user is staff or above
    logger.debug('Verifying staff permissions...', { context: 'GET /api/staff/reservists/simple' });
    const { data: isStaffOrAbove } = await supabase.rpc('is_staff_or_above', { user_uuid: user.id });
    if (!isStaffOrAbove) {
      logger.warn('❌ Insufficient permissions - Staff role required', {
        context: 'GET /api/staff/reservists/simple',
        userId: user.id
      });
      logger.separator();
      return NextResponse.json({ success: false, error: 'Forbidden - Staff access required' }, { status: 403 });
    }

    logger.success('✅ Authorization successful - Staff role confirmed', { context: 'GET /api/staff/reservists/simple', userId: user.id });

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '1000');
    logger.debug(`   Query params: status="${status}", limit=${limit}`, { context: 'GET /api/staff/reservists/simple' });

    // Call database function to get reservists with RIDS status
    logger.info('📊 Calling get_reservists_with_rids_status function...', { context: 'GET /api/staff/reservists/simple' });
    logger.debug(`   Parameters: staff_user_id=${user.id.substring(0, 8)}..., filter_status="${status}", result_limit=${limit}`, { context: 'GET /api/staff/reservists/simple' });

    const { data: functionResult, error: functionError } = await supabase.rpc('get_reservists_with_rids_status', {
      staff_user_id: user.id,
      filter_status: status,
      result_limit: limit
    });

    if (functionError) {
      logger.error('❌ Database function error', functionError, { context: 'GET /api/staff/reservists/simple' });
      logger.separator();
      return NextResponse.json({ success: false, error: 'Failed to fetch reservists' }, { status: 500 });
    }

    logger.success('✅ Database function executed successfully', { context: 'GET /api/staff/reservists/simple' });

    // Parse the JSON result (function returns JSON)
    const reservistData = Array.isArray(functionResult) ? functionResult : [];

    logger.info(`📋 Retrieved ${reservistData.length} reservists`, { context: 'GET /api/staff/reservists/simple' });

    // Log detailed RIDS status for each reservist
    if (reservistData.length > 0) {
      logger.debug('🔍 RIDS Status Details:', { context: 'GET /api/staff/reservists/simple' });
      reservistData.forEach((reservist: any, index: number) => {
        const hasRidsIcon = reservist.has_rids ? '✅' : '❌';
        logger.debug(`   ${index + 1}. ${reservist.first_name} ${reservist.last_name} (${reservist.service_number}): ${hasRidsIcon} has_rids=${reservist.has_rids}, rids_id=${reservist.rids_id || 'null'}, rids_status=${reservist.rids_status || 'null'}`, { context: 'GET /api/staff/reservists/simple' });
      });
    } else {
      logger.warn('⚠️ No reservists found matching criteria', { context: 'GET /api/staff/reservists/simple' });
    }

    logger.success(`✅ API Response Ready: ${reservistData.length} reservists with RIDS status`, {
      context: 'GET /api/staff/reservists/simple'
    });
    logger.separator();

    return NextResponse.json({ success: true, data: reservistData });
  } catch (error) {
    logger.error('💥 Unexpected API error', error, { context: 'GET /api/staff/reservists/simple' });
    logger.separator();
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
