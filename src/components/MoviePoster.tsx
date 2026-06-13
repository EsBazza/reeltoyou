'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MoviePosterProps {
  posterPath?: string | null;
  movieTitle: string;
  className?: string;
  priority?: boolean;
}

export default function MoviePoster({ posterPath, movieTitle, className, priority }: MoviePosterProps) {
  const posterUrl = getTMDBImageUrl(posterPath || null, 'w342');
  const fallbackTitle = movieTitle.split(' ')[0];

  return (
    <div className={cn('relative aspect-[2/3] w-full overflow-hidden bg-muted/20 border border-accent/5 group-hover:border-accent/40 transition-all duration-500', className)}>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={movieTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 50vw, 33vw"
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-accent/10 to-secondary/30">
          <Heart className="text-accent/30 h-6 w-6 mb-2 fill-current" />
          <span className="text-[10px] font-mono text-accent/60 uppercase tracking-tighter leading-tight font-bold">
            {fallbackTitle}
          </span>
        </div>
      )}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" />
    </div>
  );
}
