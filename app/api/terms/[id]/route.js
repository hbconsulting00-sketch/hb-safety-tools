import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function DELETE(request, { params }) {
  const supabase = createServerClient();
  const { id } = await params;

  const { error } = await supabase
    .from('saved_terms')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
