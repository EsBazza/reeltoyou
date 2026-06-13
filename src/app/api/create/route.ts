import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateAndNormalize, generateRecipientKey } from '@/lib/validation';
import { createRateLimiter, hashIp } from '@/lib/ratelimit';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const createSchema = z.object({
  recipient_name: z.string().min(1).max(50),
  movie_title: z.string().min(1),
  tmdb_id: z.number().optional(),
  quote_text: z.string().min(1).max(200),
  character_name: z.string().max(50).optional(),
  dedication: z.string().max(200).optional(),
  poster_url: z.string().url().optional().or(z.literal('')),
  gif_url: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (Privacy-safe via hashed IP)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    const identifier = await hashIp(ip);
    const { success } = await createRateLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' }, 
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const data = result.data;

    // 1. Validate & Normalize user content (Profanity check + Trim)
    let normalizedRecipient: string;
    let normalizedQuote: string;
    let normalizedDedication: string | undefined;
    let normalizedCharacter: string | undefined;

    try {
      normalizedRecipient = validateAndNormalize(data.recipient_name, 'Recipient name');
      normalizedQuote = validateAndNormalize(data.quote_text, 'Quote');
      
      if (data.dedication) {
        normalizedDedication = validateAndNormalize(data.dedication, 'Dedication');
      }
      
      if (data.character_name) {
        normalizedCharacter = data.character_name.trim().replace(/\s+/g, ' ');
      }
    } catch (validationError) {
      const message = validationError instanceof Error ? validationError.message : 'Validation failed';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // 2. Prepare database entry
    const slug = nanoid(8);
    const recipient_name_key = generateRecipientKey(normalizedRecipient);

    const { error } = await supabaseAdmin
      .from('entries')
      .insert({
        slug,
        recipient_name: normalizedRecipient,
        recipient_name_key,
        movie_title: data.movie_title,
        tmdb_id: data.tmdb_id,
        quote_text: normalizedQuote,
        character_name: normalizedCharacter,
        dedication: normalizedDedication,
        poster_url: data.poster_url,
        gif_url: data.gif_url,
      });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ slug });

  } catch (error) {
    console.error('Create API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
