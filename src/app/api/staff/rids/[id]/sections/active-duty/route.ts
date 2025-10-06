import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id: ridsId } = await params;

    const { data, error } = await supabase
      .from('rids_active_duty')
      .select('*')
      .eq('rids_form_id', ridsId)
      .order('date_start', { ascending: false });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching active duty', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id: ridsId } = await params;
    const body = await request.json();
    const { data, error } = await supabase
      .from('rids_active_duty')
      .insert({
        rids_form_id: ridsId,
        unit: body.unit,
        purpose: body.purpose,
        authority: body.authority,
        date_start: body.date_start,
        date_end: body.date_end,
        efficiency_rating: body.efficiency_rating || null,
        evaluator: body.evaluator || null,
        remarks: body.remarks || null,
        verification_status: body.verification_status || 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Active duty entry created successfully' });
  } catch (error) {
    logger.error('Error creating active duty', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
