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
      .from('rids_designations')
      .select('*')
      .eq('rids_form_id', ridsId)
      .order('date_from', { ascending: false });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching designations', error);
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
      .from('rids_designations')
      .insert({
        rids_form_id: ridsId,
        position: body.position,
        authority: body.authority,
        date_from: body.date_from,
        date_to: body.date_to || null,
        is_current: body.is_current || false,
        responsibilities: body.responsibilities || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Designation entry created successfully' });
  } catch (error) {
    logger.error('Error creating designation', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
