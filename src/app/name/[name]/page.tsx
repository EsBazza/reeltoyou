'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Heart, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import MoviePoster from '@/components/MoviePoster';

interface Entry {
  id: string;
  slug: string;
  recipient_name: string;
  movie_title: string;
  quote_text: string;
  character_name: string;
  dedication: string;
  poster_url: string;
  gif_url: string;
  created_at: string;
}

export default function NameSearchPage() {
  const params = useParams();
  const name = params.name as string;
  const decodedName = decodeURIComponent(name);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<{ created_at: string; id: string } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const fetchEntries = useCallback(async (currentCursor: typeof cursor) => {
    try {
      setIsLoading(true);
      let url = `/api/entries?name=${encodeURIComponent(name)}`;
      if (currentCursor) {
        url += `&cursor_created_at=${currentCursor.created_at}&cursor_id=${currentCursor.id}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.entries) {
        setEntries(prev => currentCursor ? [...prev, ...data.entries] : data.entries);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [name]);

  useEffect(() => {
    fetchEntries(null);
  }, [fetchEntries]);

  const lastEntryRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchEntries(cursor);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchEntries, cursor]);

  // A-Z Logic
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    entries.forEach(e => {
      const firstChar = e.movie_title.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) letters.add(firstChar);
    });
    return letters;
  }, [entries]);

  const scrollToLetter = (letter: string) => {
    const firstMatch = entries.find(e => e.movie_title.charAt(0).toUpperCase() === letter);
    if (firstMatch) {
      const element = entryRefs.current.get(firstMatch.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-background fade-in-up">
      {/* Alphabet Sidebar (Desktop) */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col space-y-1 z-50">
        {alphabet.map(letter => {
          const isAvailable = availableLetters.has(letter);
          return (
            <button
              key={letter}
              disabled={!isAvailable}
              onClick={() => scrollToLetter(letter)}
              className={`text-[10px] font-serif w-6 h-6 flex items-center justify-center transition-all rounded-full ${
                isAvailable ? 'text-accent hover:bg-accent hover:text-white cursor-pointer' : 'text-gray-300 opacity-20'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </aside>

      <div className="w-full max-w-2xl space-y-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center text-[10px] font-serif uppercase tracking-widest text-gray-400 hover:text-accent transition-colors group">
            <ArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
          <div className="text-[10px] font-serif uppercase tracking-widest text-gray-400">
            Archive Index
          </div>
        </header>

        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="wax-seal scale-75 opacity-20 animated-wax-seal bg-[#b91c1c] border-2 border-[#991b1b]">
              <Heart className="h-5 w-5 text-white fill-current" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold italic tracking-tighter leading-none text-foreground font-serif">
            {decodedName}
          </h1>
          <p className="text-[10px] font-serif text-gray-400 uppercase tracking-[0.3em]">
            Saved Moments
          </p>
        </div>

        {/* Entries List */}
        <div className="space-y-12">
          {entries.map((entry, index) => (
            <div key={entry.id} className="relative group">
              <article 
                ref={(el) => {
                  if (el) entryRefs.current.set(entry.id, el as HTMLDivElement);
                  if (index === entries.length - 1) lastEntryRef(el as HTMLDivElement);
                }}
                className="bg-paper-texture border border-amber-100 dark:border-amber-900/20 overflow-hidden relative hover:shadow-xl transition-all duration-500 flex flex-row group shadow-md rounded-md p-2"
              >
                {/* Media Column - Vertical Portrait */}
                <div className="w-24 sm:w-28 aspect-[2/3] bg-muted overflow-hidden shrink-0 relative rounded-sm">
                  <MoviePoster 
                    posterPath={entry.poster_url} 
                    movieTitle={entry.movie_title}
                    className="border-none h-full opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Content Column - Letter Style */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col space-y-3 overflow-hidden">
                  <div className="space-y-1">
                    <p className="text-[8px] font-serif text-accent uppercase tracking-widest font-bold">Feature Film</p>
                    <h3 className="text-sm font-serif font-bold tracking-tight truncate text-foreground">{entry.movie_title}</h3>
                  </div>

                  <blockquote className="space-y-1">
                    <p className="font-serif italic text-base text-foreground leading-snug line-clamp-3">
                      &quot;{entry.quote_text}&quot;
                    </p>
                    {entry.character_name && (
                      <cite className="block text-[8px] font-serif text-gray-400 uppercase not-italic tracking-widest truncate">
                        — {entry.character_name}
                      </cite>
                    )}
                  </blockquote>

                  <div className="w-12 h-px bg-amber-300/30 dark:bg-amber-700/30 my-1"></div>

                  {entry.dedication && (
                    <div className="p-3 bg-secondary/30 italic text-[10px] text-gray-500 font-serif leading-relaxed line-clamp-2 rounded-sm border-l border-accent/20">
                      {entry.dedication}
                    </div>
                  )}

                  <div className="pt-3 border-t border-accent/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs font-serif text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-serif whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <Link 
                      href={`/entry/${entry.slug}`}
                      className="text-[10px] font-serif font-bold text-accent uppercase tracking-widest hover:text-accent/80 flex items-center shrink-0"
                    >
                      Read letter ✈️
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-8">
               {Array.from({ length: 2 }).map((_, i) => (
                 <div key={i} className="flex flex-row gap-0 bg-paper border border-amber-100 h-[200px] rounded-md overflow-hidden">
                    <Skeleton className="w-24 sm:w-28 h-full" />
                    <div className="flex-1 p-6 space-y-4">
                       <Skeleton className="h-3 w-1/4" />
                       <Skeleton className="h-12 w-full" />
                       <Skeleton className="h-24 w-full" />
                    </div>
                 </div>
               ))}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="text-center py-24 bg-paper-texture border border-dashed border-accent/10 space-y-8 rounded-md">
              <Mail className="mx-auto h-16 w-16 text-accent/20 -rotate-12" />
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold italic tracking-tighter text-foreground">No Records Found</h3>
                <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest leading-loose">
                  The archive contains no moments<br />addressed to this name.
                </p>
              </div>
              <Link href="/" className="inline-block">
                <Button size="lg" className="bg-accent hover:bg-accent/90 rounded-md shadow-lg shadow-accent/20 text-white font-bold">Share a Moment</Button>
              </Link>
            </div>
          )}

          {!hasMore && entries.length > 0 && (
            <div className="flex flex-col items-center py-12 space-y-4">
              <div className="w-px h-8 bg-amber-300/30 dark:bg-amber-700/30"></div>
              <p className="text-[8px] font-serif text-gray-400 uppercase tracking-[0.5em]">End of Archive</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
