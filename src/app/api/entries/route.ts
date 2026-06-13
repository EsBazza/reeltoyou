import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const name = searchParams.get('name');
  const cursorCreatedAt = searchParams.get('cursor_created_at');
  const cursorId = searchParams.get('cursor_id');
  const limit = 10;

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  let query = supabase
    .from('entries')
    .select('*')
    .eq('recipient_name_key', name.toLowerCase().trim())
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);

  // Keyset pagination logic
  if (cursorCreatedAt && cursorId) {
    query = query.or(
      `created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fetch entries error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }

  const nextCursor = data.length === limit ? {
    created_at: data[data.length - 1].created_at,
    id: data[data.length - 1].id
  } : null;

  return NextResponse.json({
    entries: data,
    nextCursor
  });
}
