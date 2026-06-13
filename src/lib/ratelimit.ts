import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { crypto } from 'next/dist/compiled/@edge-runtime/primitives';

// 1. Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 2. Create a rate limiter: 3 requests per 10 minutes per IP
export const createRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/create',
});

/**
 * Privacy-safe IP hashing
 */
export async function hashIp(ip: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(ip + process.env.SUPABASE_SECRET_KEY);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
