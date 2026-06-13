'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Quote as QuoteIcon, Mail, Heart, Info } from 'lucide-react';
import Link from 'next/link';
import ReportButton from '@/components/ReportButton';
import EntryActions from '@/components/EntryActions';
import MoviePoster from '@/components/MoviePoster';

interface Entry {
  id: string;
  slug: string;
  recipient_name: string;
  recipient_name_key: string;
  movie_title: string;
  quote_text: string;
  character_name: string;
  dedication: string;
  poster_url: string;
  gif_url: string;
  created_at: string;
  is_hidden: boolean;
}

export default function EntryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    async function fetchEntry() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setEntry(null);
      } else {
        setEntry(data);
      }
      setIsLoading(false);
    }
    fetchEntry();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!entry || entry.is_hidden) {
    return notFound();
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // The "Sealed Letter" Initial State
  if (!isOpened) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-12 fade-in-up">
        <div className="space-y-4">
          <p className="text-[10px] font-serif text-gray-400 uppercase tracking-[0.3em]">A Secret Awaits</p>
          <h1 className="text-2xl font-serif font-bold italic tracking-tighter text-foreground">A letter for {entry.recipient_name}</h1>
        </div>

        <button 
          onClick={() => setIsOpened(true)}
          className="group relative transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative p-12 bg-paper-texture border border-amber-100 dark:border-amber-900/20 shadow-2xl rounded-md transition-all group-hover:shadow-amber-900/10">
            <Mail className="h-24 w-24 text-accent/20 -rotate-6" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 wax-seal wax-seal-animate flex items-center justify-center shadow-2xl scale-125 opacity-100 bg-[#b91c1c] border-2 border-[#991b1b]">
              <Heart className="h-5 w-5 text-white fill-current" />
            </div>
          </div>
          <div className="mt-12 text-[10px] font-serif text-accent uppercase tracking-[0.3em] animate-pulse font-bold">
            Tap to reveal
          </div>
        </button>

        <Link href="/" className="text-[10px] font-serif text-gray-400 uppercase tracking-widest hover:text-accent transition-colors pt-12">
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center pb-20 fade-in-up">
      <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-muted px-4 md:px-8 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-[10px] font-serif uppercase tracking-widest text-gray-400 hover:text-foreground transition-all group"
        >
          <ArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          Archive
        </button>
        <Link href="/" className="text-sm font-serif font-bold uppercase italic tracking-tighter hover:text-accent transition-colors text-foreground">
          Reel To You
        </Link>
        <div className="w-20 hidden md:block" />
      </header>

      <div className="w-full max-w-xl p-4 md:p-12 space-y-12">
        <article className="bg-paper-texture border border-amber-100 dark:border-amber-900/20 overflow-hidden relative shadow-2xl rounded-md p-1">
          {/* Main Visual Header: Clip or Poster Fallback */}
          <div className="relative w-full bg-secondary/30 dark:bg-black/40 overflow-hidden border-b border-muted/30 flex items-center justify-center rounded-t-sm">
            {entry.gif_url ? (
              <div className="aspect-video w-full bg-black">
                <video
                  src={entry.gif_url}
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-[7px] font-mono uppercase tracking-widest text-white/60 pointer-events-none rounded-sm">
                  Clip via KLIPY
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[240px] aspect-[2/3] py-8">
                <MoviePoster 
                  posterPath={entry.poster_url} 
                  movieTitle={entry.movie_title}
                  className="w-full h-full border-2 border-accent/10 shadow-2xl"
                  priority
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent opacity-40 pointer-events-none" />
          </div>

          <div className="p-8 md:p-12 space-y-12 relative">
            <div className="space-y-4 text-center">
               {/* Centered Wax Seal Symbol */}
               <div className="flex justify-center">
                  <div className="wax-seal scale-75 opacity-20 animated-wax-seal bg-[#b91c1c] border-2 border-[#991b1b]">
                    <Heart className="h-5 w-5 text-white fill-current" />
                  </div>
               </div>
               
               <div className="space-y-1">
                 <p className="text-[10px] font-serif text-accent uppercase tracking-[0.4em] font-bold">Sealed Letter</p>
                 <h2 className="text-2xl font-serif font-bold tracking-tight text-foreground">{entry.movie_title}</h2>
               </div>
               
               <div className="flex items-center justify-center gap-2 text-xs font-serif text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
               </div>
            </div>

            <div className="w-16 h-px bg-amber-300/30 dark:bg-amber-700/30 mx-auto"></div>

            {/* Quote Block */}
            <div className="space-y-6 relative">
              <QuoteIcon className="absolute -top-8 -left-6 h-16 w-16 text-accent/5 -z-0 rotate-180" />
              <blockquote className="text-center space-y-6 relative z-10">
                <p className="quote-text mx-auto text-foreground leading-relaxed">
                  &quot;{entry.quote_text}&quot;
                </p>
                {entry.character_name && (
                  <footer className="text-[10px] font-serif text-gray-400 uppercase tracking-[0.3em]">
                    — {entry.character_name}
                  </footer>
                )}
              </blockquote>
            </div>

            <div className="w-16 h-px bg-amber-300/30 dark:bg-amber-700/30 mx-auto"></div>

            {/* Dedication Block */}
            <div className="space-y-8">
              <div className="flex flex-col items-center space-y-3 text-center">
                <p className="text-[10px] font-serif text-gray-400 uppercase tracking-[0.3em]">For the attention of</p>
                <Link 
                  href={`/name/${encodeURIComponent(entry.recipient_name_key)}`}
                  className="recipient-tag text-xl font-bold tracking-widest hover:text-accent transition-all font-serif"
                >
                  {entry.recipient_name}
                </Link>
              </div>

              {entry.dedication ? (
                <div className="p-8 bg-secondary/20 border border-accent/5 relative rounded-sm text-center">
                   <p className="text-gray-500 font-serif italic leading-relaxed max-w-sm mx-auto text-sm">
                    &quot;{entry.dedication}&quot;
                  </p>
                </div>
              ) : (
                <p className="text-center text-[10px] font-serif text-gray-400 uppercase tracking-widest italic">
                  A silent message from the heart.
                </p>
              )}
            </div>
          </div>
          
          <footer className="p-8 bg-secondary/10 flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-accent/5">
             <ReportButton slug={entry.slug} />
          </footer>
        </article>

        <EntryActions recipientName={entry.recipient_name} />

        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-12 h-px bg-amber-300/30 dark:bg-amber-700/30 mx-auto"></div>
          <div className="flex items-center space-x-2 text-[8px] font-serif text-gray-400 uppercase tracking-widest">
            <Info className="h-3 w-3" />
            <span>Archive Index: {entry.slug}</span>
          </div>
          <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest leading-loose max-w-xs mx-auto">
            A moment preserved, forever.
          </p>
        </div>
      </div>
    </main>
  );
}
