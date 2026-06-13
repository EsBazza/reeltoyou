import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new Response('Slug is required', { status: 400 });
    }

    const { data: entry, error } = await createClient()
      .from('entries')
      .select('movie_title, quote_text, recipient_name, poster_url')
      .eq('slug', slug)
      .single();

    if (error || !entry) {
      // Fallback brand image
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fdfaf6',
              color: '#3d3a35',
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 'bold', fontStyle: 'italic', marginBottom: 20, color: '#f5b042' }}>Reel To You</div>
            <div style={{ fontSize: 24, letterSpacing: '0.3em', color: '#e8e1d5' }}>A TIME CAPSULE OF MOVIE MOMENTS</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const truncatedQuote = entry.quote_text.length > 120 
      ? entry.quote_text.slice(0, 120) + '...' 
      : entry.quote_text;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#fdfaf6',
            color: '#3d3a35',
            fontFamily: 'serif',
            padding: '60px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {entry.poster_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={entry.poster_url}
              alt={entry.movie_title}
              style={{
                width: '280px',
                height: '420px',
                objectFit: 'cover',
                marginRight: '60px',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
              }}
            />
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 20, color: '#f5b042', marginBottom: 15, fontWeight: 'bold', letterSpacing: '0.2em' }}>
              A MOMENT FOR YOU
            </div>
            <div style={{ fontSize: 44, fontStyle: 'italic', marginBottom: 35, lineHeight: 1.3, color: '#3d3a35' }}>
              &quot;{truncatedQuote}&quot;
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#3d3a35', marginBottom: 8 }}>
                {entry.movie_title.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, color: '#f5b042', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                FOR: {entry.recipient_name.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('OG Image Generation Error:', err);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
