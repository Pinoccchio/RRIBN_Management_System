import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('rids_military_training')
      .select('*')
      .eq('rids_form_id', params.id)
      .order('date_graduated', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching military training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('rids_military_training')
      .insert({
        rids_form_id: params.id,
        training_name: body.training_name,
        school: body.school,
        date_graduated: body.date_graduated,
        certificate_number: body.certificate_number || null,
        training_category: body.training_category || null,
        duration_days: body.duration_days || null,
        verification_status: body.verification_status || 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Military training entry created successfully' });
  } catch (error) {
    logger.error('Error creating military training', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
