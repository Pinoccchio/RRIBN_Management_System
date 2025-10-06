import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id: ridsId, entryId } = await params;
    const body = await request.json();
    const { data, error } = await supabase
      .from('rids_unit_assignments')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('rids_form_id', ridsId)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data, message: 'Unit assignment entry updated successfully' });
  } catch (error) {
    logger.error('Error updating unit assignment', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { id: ridsId, entryId } = await params;

    const { error } = await supabase
      .from('rids_unit_assignments')
      .delete()
      .eq('id', entryId)
      .eq('rids_form_id', ridsId);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Unit assignment entry deleted successfully' });
  } catch (error) {
    logger.error('Error deleting unit assignment', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
