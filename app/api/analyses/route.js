import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('saved_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analyses: data });
}

export async function POST(request) {
  const supabase = createServerClient();
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 }); }

  const { name, summary, score, items } = body;
  if (!name) return NextResponse.json({ error: 'חסר שם ניתוח' }, { status: 400 });

  const { data, error } = await supabase
    .from('saved_analyses')
    .insert([{ name, summary, score, items }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analysis: data }, { status: 201 });
}
