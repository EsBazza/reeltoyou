'use client';

import { useState } from 'react';
import MovieSearch from '@/components/MovieSearch';
import QuoteSelector, { Quote } from '@/components/QuoteSelector';
import ClipSelector from '@/components/ClipSelector';
import EntryForm from '@/components/EntryForm';
import { Movie, getTMDBImageUrl } from '@/lib/tmdb';
import { CheckCircle2, Share2, Copy, ArrowRight, Mail, Heart, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

export default function Home() {
  const [mode, setMode] = useState<'home' | 'create' | 'search'>('home');
  const [searchName, setSearchName] = useState('');
  
  // Creation Flow State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [clipStepFinished, setClipStepFinished] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Determine current step for progress indicator
  const currentStep = !selectedMovie ? 'movie' : !selectedQuote ? 'quote' : !clipStepFinished ? 'clip' : 'dedication';
  
  const completedSteps = new Set<'movie' | 'quote' | 'clip' | 'dedication'>();
  if (selectedMovie) completedSteps.add('movie');
  if (selectedQuote) completedSteps.add('quote');
  if (clipStepFinished) completedSteps.add('clip');

  const handleStepClick = (step: 'movie' | 'quote' | 'clip' | 'dedication') => {
    if (step === 'movie') {
      setSelectedMovie(null);
      setSelectedQuote(null);
      setSelectedClip(null);
      setClipStepFinished(false);
    } else if (step === 'quote') {
      setSelectedQuote(null);
      setSelectedClip(null);
      setClipStepFinished(false);
    } else if (step === 'clip') {
      setClipStepFinished(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleQuoteSelect = (quote: Quote) => {
    setSelectedQuote(quote);
  };

  const handleClipSelect = (clipUrl: string | null) => {
    setSelectedClip(clipUrl);
    setClipStepFinished(true);
  };

  const handleSubmit = async (formData: { recipientName: string; dedication: string }) => {
    if (!selectedMovie || !selectedQuote) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: formData.recipientName,
          movie_title: selectedMovie.title,
          tmdb_id: selectedMovie.id,
          quote_text: selectedQuote.text,
          character_name: selectedQuote.character,
          dedication: formData.dedication,
          poster_url: getTMDBImageUrl(selectedMovie.poster_path, 'w342'),
          gif_url: selectedClip || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create entry');
      }

      setCreatedSlug(data.slug);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/entry/${createdSlug}` 
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Moment saved – it's forever.");
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setMode('home');
    setSelectedMovie(null);
    setSelectedQuote(null);
    setSelectedClip(null);
    setClipStepFinished(false);
    setCreatedSlug(null);
  };

  // Success Screen
  if (createdSlug) {
    return (
      <main className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center space-y-12 bg-background fade-in-up">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="relative flex justify-center">
            <div className="relative">
              <Mail className="h-24 w-24 text-accent/40 -rotate-6" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 wax-seal wax-seal-animate flex items-center justify-center shadow-xl scale-125 opacity-100 bg-[#b91c1c] border-2 border-[#991b1b]">
                <Heart className="h-5 w-5 text-white fill-current" />
              </div>
            </div>
            <CheckCircle2 className="absolute -top-2 -right-2 h-8 w-8 text-green-500 bg-paper rounded-full p-1 shadow-md" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold italic tracking-tighter text-foreground">Moment Shared</h1>
            <p className="text-gray-400 font-serif text-[10px] uppercase tracking-widest">Digital Archive Index: {createdSlug}</p>
          </div>

          <div className="p-8 bg-paper-texture border border-amber-100 dark:border-amber-900/20 space-y-6 relative overflow-hidden rounded-md shadow-2xl">
            <p className="text-[10px] font-serif text-gray-400 uppercase tracking-[0.3em]">Your Secret Link</p>
            <div className="flex items-center space-x-2 bg-secondary/50 border border-accent/10 p-3 text-left overflow-hidden rounded-sm">
              <span className="flex-1 text-[10px] font-mono text-gray-600 truncate">{shareUrl}</span>
              <button onClick={copyToClipboard} className="p-2 hover:text-accent transition-colors flex-shrink-0">
                {copied ? <span className="text-[8px] font-bold text-accent uppercase">Copied</span> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            
            <Button className="w-full bg-accent hover:bg-accent/90" size="lg" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'A movie moment for you', url: shareUrl });
              } else {
                copyToClipboard();
              }
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Send the Letter
            </Button>
          </div>

          <div className="pt-8 flex flex-col space-y-4">
            <Link 
              href={`/entry/${createdSlug}`}
              className="text-[10px] font-serif uppercase tracking-[0.2em] hover:text-accent flex items-center justify-center group text-foreground"
            >
              Open the Letter <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={reset}
              className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-400 hover:text-accent transition-colors"
            >
              Share Another Moment
            </button>
          </div>

          <div className="pt-4">
            <div className="w-12 h-px bg-amber-300 dark:bg-amber-700 mx-auto mb-4 opacity-50"></div>
            <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest leading-loose max-w-xs mx-auto">
              A moment preserved, forever.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 flex flex-col items-center bg-background fade-in-up">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg space-y-12 mt-8 md:mt-16">
        <header className="text-center space-y-8">
          {/* Centered animated wax seal */}
          <div className="flex justify-center">
            <div className="wax-seal scale-75 opacity-20 animated-wax-seal bg-[#b91c1c] border-2 border-[#991b1b]">
              <Heart className="h-5 w-5 text-white fill-current" />
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/" onClick={reset} className="inline-block">
              <h1 className="text-5xl font-serif font-bold uppercase italic tracking-tighter hover:text-accent transition-colors text-foreground">Reel To You</h1>
            </Link>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto font-serif">
              A time capsule of movie quotes.<br />
              Addressed to someone. Public forever.
            </p>
          </div>
        </header>

        {mode === 'home' && (
          <div key="home" className="space-y-12 fade-in-up">
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={() => setMode('create')}
                className="px-8 py-4 bg-accent text-white rounded-md font-serif font-bold uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-95 shadow-lg shadow-accent/20 flex-1 text-center"
              >
                Send a moment
              </button>
              <button 
                onClick={() => setMode('search')}
                className="px-8 py-4 border-2 border-muted rounded-md font-serif font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-all active:scale-95 flex-1 text-center text-foreground"
              >
                Find a name
              </button>
            </div>

            <div className="space-y-8">
              <div className="w-16 h-px bg-amber-300/30 dark:bg-amber-700/30 mx-auto"></div>
              <p className="text-center text-[10px] font-serif text-gray-400 pt-0 uppercase tracking-[0.3em]">
                ✦ A permanent archive of shared feelings ✦
              </p>
            </div>
          </div>
        )}

        {mode === 'search' && (
          <div key="search" className="space-y-12 fade-in-up">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-serif font-bold italic tracking-tighter text-foreground">Search the Archive</h2>
              <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest leading-loose">
                Type a name to retrieve all moments<br />addressed to them.
              </p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchName.trim()) {
                  window.location.href = `/name/${encodeURIComponent(searchName.trim().toLowerCase())}`;
                }
              }}
              className="space-y-6"
            >
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Recipient name..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-accent/10 rounded-md focus:border-accent outline-none transition-all font-serif bg-paper"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 font-serif">
                Locate Moments
              </Button>
            </form>
            
            <button 
              onClick={() => setMode('home')}
              className="w-full text-[10px] font-serif text-gray-400 uppercase tracking-widest hover:text-accent transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div key="create" className="fade-in-up">
            <ProgressIndicator 
              currentStep={currentStep} 
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
            />

            {!selectedMovie ? (
              <MovieSearch onSelect={handleMovieSelect} />
            ) : !selectedQuote ? (
              <QuoteSelector 
                tmdbId={selectedMovie.id} 
                onSelect={handleQuoteSelect} 
                onBack={() => setSelectedMovie(null)} 
              />
            ) : !clipStepFinished ? (
              <ClipSelector
                movieTitle={selectedMovie.title}
                onSelect={handleClipSelect}
                onBack={() => setSelectedQuote(null)}
                selectedClipUrl={selectedClip}
              />
            ) : (
              <EntryForm 
                movieTitle={selectedMovie.title}
                quoteText={selectedQuote.text}
                characterName={selectedQuote.character}
                onSubmit={handleSubmit}
                onBack={() => setClipStepFinished(false)}
                isLoading={isSubmitting}
                error={submitError}
              />
            )}
            
            <div className="mt-12 flex flex-col items-center space-y-8 border-t border-accent/5 pt-8">
              <div className="w-12 h-px bg-amber-300/30 dark:bg-amber-700/30"></div>
              <button 
                onClick={reset}
                className="text-[10px] font-serif text-gray-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center"
              >
                <RefreshCcw className="h-3 w-3 mr-2" />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
