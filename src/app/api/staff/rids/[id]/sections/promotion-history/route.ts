import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/staff/rids/[id]/sections/promotion-history
 * Get all promotion history entries for a RIDS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ridsId } = await params;

    const { data, error } = await supabase
      .from('rids_promotion_history')
      .select('*')
      .eq('rids_form_id', ridsId)
      .order('entry_number', { ascending: true });

    if (error) {
      logger.error('Failed to fetch promotion history', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Unexpected error fetching promotion history', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/rids/[id]/sections/promotion-history
 * Add new promotion history entry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ridsId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.rank || !body.date_of_rank || !body.authority || !body.entry_number) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rids_promotion_history')
      .insert({
        rids_form_id: ridsId,
        entry_number: body.entry_number,
        rank: body.rank,
        date_of_rank: body.date_of_rank,
        authority: body.authority,
        action_type: body.action_type || 'Promotion',
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create promotion history entry', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logger.success('Promotion history entry created', { id: data.id });
    return NextResponse.json({
      success: true,
      data,
      message: 'Promotion history entry created successfully',
    });
  } catch (error) {
    logger.error('Unexpected error creating promotion history', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
