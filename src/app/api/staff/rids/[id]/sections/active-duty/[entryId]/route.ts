import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
      .from('rids_active_duty')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.entryId)
      .eq('rids_form_id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Active duty entry updated successfully' });
  } catch (error) {
    logger.error('Error updating active duty', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('rids_active_duty')
      .delete()
      .eq('id', params.entryId)
      .eq('rids_form_id', params.id);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Active duty entry deleted successfully' });
  } catch (error) {
    logger.error('Error deleting active duty', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
