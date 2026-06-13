import { NextRequest, NextResponse } from 'next/server';

const KLIPY_API_KEY = process.env.KLIPY_API_KEY;
const KLIPY_BASE_URL = 'https://api.klipy.com/api/v1';

interface KlipyClip {
  slug?: string;
  id: string;
  title: string;
  file?: {
    mp4?: string;
    mp4_hd?: string;
  };
  file_meta?: {
    mp4?: { width?: number; height?: number };
    mp4_hd?: { width?: number; height?: number };
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!KLIPY_API_KEY) {
    console.error('KLIPY_API_KEY is not defined');
    return NextResponse.json({ error: 'KLIPY API not configured' }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const url = `${KLIPY_BASE_URL}/${KLIPY_API_KEY}/clips/search?q=${encodeURIComponent(query)}&per_page=12`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('KLIPY API Error Status:', response.status);
      return NextResponse.json({ error: `KLIPY API error: ${response.status}` }, { status: response.status });
    }

    if (response.status === 204) {
      return NextResponse.json([]);
    }

    const json = await response.json();
    const rawClips: KlipyClip[] = json.data?.data || [];
    
    const normalizedClips = rawClips.map((clip: KlipyClip) => {
      const isHd = !!clip.file?.mp4_hd;
      const sourceUrl = isHd ? clip.file?.mp4_hd : (clip.file?.mp4 || '');
      const meta = isHd ? (clip.file_meta?.mp4_hd || {}) : (clip.file_meta?.mp4 || {});

      return {
        id: clip.slug || clip.id,
        title: clip.title,
        src: sourceUrl,
        width: meta.width || 1280,
        height: meta.height || 720,
      };
    });

    return NextResponse.json(normalizedClips);
  } catch (error) {
    console.error('Clips API Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
