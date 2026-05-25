import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('saved_terms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ terms: data });
}

export async function POST(request) {
  const supabase = createServerClient();
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 }); }

  const { term, definition, practical } = body;
  if (!term) return NextResponse.json({ error: 'חסר שם מושג' }, { status: 400 });

  const { data, error } = await supabase
    .from('saved_terms')
    .insert([{ term, definition, practical }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ term: data }, { status: 201 });
}
