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
      .from('rids_awards')
      .select('*')
      .eq('rids_form_id', ridsId)
      .order('date_awarded', { ascending: false });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching awards', error);
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
      .from('rids_awards')
      .insert({
        rids_form_id: ridsId,
        award_name: body.award_name,
        authority: body.authority,
        date_awarded: body.date_awarded,
        citation: body.citation || null,
        award_category: body.award_category || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Award entry created successfully' });
  } catch (error) {
    logger.error('Error creating award', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
