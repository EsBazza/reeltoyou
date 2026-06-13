import { NextRequest, NextResponse } from 'next/server';
import quotesData from '@/data/quotes.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdb_id');

  if (!tmdbId) {
    return NextResponse.json({ error: 'tmdb_id is required' }, { status: 400 });
  }

  const id = parseInt(tmdbId, 10);
  const movieEntry = quotesData.find((m) => m.tmdb_id === id);

  if (!movieEntry) {
    return NextResponse.json({ quotes: [] });
  }

  return NextResponse.json({ quotes: movieEntry.quotes });
}
