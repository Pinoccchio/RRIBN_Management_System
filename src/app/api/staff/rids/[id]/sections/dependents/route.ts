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
      .from('rids_dependents')
      .select('*')
      .eq('rids_form_id', ridsId);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching dependents', error);
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
      .from('rids_dependents')
      .insert({
        rids_form_id: ridsId,
        relation: body.relation,
        full_name: body.full_name,
        birthdate: body.birthdate || null,
        contact_info: body.contact_info || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Dependent entry created successfully' });
  } catch (error) {
    logger.error('Error creating dependent', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
