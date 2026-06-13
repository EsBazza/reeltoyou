'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/Skeleton';
import { Button } from './ui/Button';
import { Heart } from 'lucide-react';

export interface Quote {
  text: string;
  character: string;
}

interface QuoteSelectorProps {
  tmdbId: number;
  onSelect: (quote: Quote) => void;
  onBack: () => void;
}

export default function QuoteSelector({ tmdbId, onSelect, onBack }: QuoteSelectorProps) {
  const [curatedQuotes, setCuratedQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customQuote, setCustomQuote] = useState('');
  const [customCharacter, setCustomCharacter] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const response = await fetch(`/api/quotes?tmdb_id=${tmdbId}`);
        const data = await response.json();
        setCuratedQuotes(data.quotes || []);
      } catch (error) {
        console.error('Failed to fetch quotes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, [tmdbId]);

  const handleQuoteClick = (quote: Quote) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onSelect(quote);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center">
          <Heart className="h-4 w-4 text-accent mr-2 fill-current" />
          Choose a Line
        </h2>
        <Button variant="ghost" size="sm" onClick={onBack} className="text-[10px] font-mono opacity-50 hover:opacity-100 uppercase">
          Back
        </Button>
      </div>

      {!isCustomMode ? (
        <div className="space-y-6">
          <div className="flex overflow-x-auto pb-4 gap-4 desktop-scroll -mx-4 px-4 snap-x">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[280px] h-[120px] shrink-0" />
              ))
            ) : curatedQuotes.length > 0 ? (
              curatedQuotes.map((quote, index) => (
                <div
                  key={index}
                  onClick={() => handleQuoteClick(quote)}
                  className="min-w-[280px] md:min-w-[320px] shrink-0 p-6 bg-paper border border-muted hover:border-accent hover:marquee-glow transition-all duration-300 snap-center flex flex-col justify-between active:scale-95 cursor-pointer rounded-md shadow-sm"
                >
                  <blockquote className="space-y-4">
                    <p className="font-serif italic text-lg leading-relaxed line-clamp-4 text-foreground">
                      &quot;{quote.text}&quot;
                    </p>
                    <cite className="block text-[10px] font-mono text-gray-400 uppercase not-italic tracking-widest">
                      — {quote.character}
                    </cite>
                  </blockquote>
                  <div className="mt-6 pt-4 border-t border-accent/5 flex justify-end">
                     <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Pick This Moment</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 text-center py-12 border-2 border-dashed border-muted w-full rounded-md">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">No curated quotes found</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCustomMode(true)}
            className="w-full py-4 border-2 border-dashed border-muted text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 hover:border-accent hover:text-accent transition-all active:scale-[0.98] rounded-sm"
          >
            + Write your own line
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Your selected quote</label>
            <textarea
              autoFocus
              className="w-full bg-paper border-2 border-muted p-4 font-serif italic text-lg focus:border-accent outline-none transition-all resize-none min-h-[140px] text-foreground rounded-md focus:marquee-glow"
              placeholder="Type the movie quote here..."
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              maxLength={200}
            />
            <p className="text-right text-[10px] font-mono text-gray-400">
              {customQuote.length}/200
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Who said it?</label>
            <input
              type="text"
              className="w-full bg-paper border-2 border-muted px-4 py-3 text-sm focus:border-accent outline-none transition-all text-foreground rounded-md focus:marquee-glow"
              placeholder="Character Name (Optional)"
              value={customCharacter}
              onChange={(e) => setCustomCharacter(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsCustomMode(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-accent hover:bg-accent/90" 
              disabled={!customQuote.trim()}
              onClick={() => handleQuoteClick({ text: customQuote, character: customCharacter })}
            >
              Use This
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
