'use client';

import { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { Search, X, Heart } from 'lucide-react';
import { Input } from './Input';
import { Skeleton } from './Skeleton';

interface Clip {
  id: string;
  title: string;
  src: string;
}

interface GifSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clipUrl: string) => void;
  movieTitle: string;
}

export function GifSheet({ isOpen, onClose, onSelect, movieTitle }: GifSheetProps) {
  const [query, setQuery] = useState(movieTitle);
  const deferredQuery = useDeferredValue(query);
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const fetchClips = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/clips?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setClips(data);
    } catch (err) {
      console.error(err);
      setError('Could not load clips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchClips(deferredQuery);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, deferredQuery, fetchClips]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        ref={sheetRef}
        className="relative w-full max-w-lg bg-paper border-t-2 sm:border-2 border-accent/10 h-[80vh] sm:h-auto max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500 rounded-t-xl sm:rounded-md shadow-2xl"
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden w-full flex justify-center py-3 bg-secondary/30">
          <div className="w-12 h-1 bg-accent/20 rounded-full" />
        </div>

        <div className="p-6 border-b border-accent/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-accent fill-current" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground italic font-serif">Choose a Moment</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              autoFocus
              className="pl-12 bg-background border-accent/10 focus:border-accent"
              placeholder="Search for a specific scene..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 border-2 border-dashed border-accent/10 rounded-md">
               <p className="text-xs font-mono text-accent uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-8">
              {clips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => onSelect(clip.src)}
                  className="group relative aspect-video bg-muted border-2 border-accent/5 hover:border-accent overflow-hidden transition-all active:scale-95 duration-75 rounded-md"
                >
                  <video
                    src={clip.src}
                    muted
                    loop
                    playsInline
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase bg-accent text-white px-2 py-1 rounded-sm shadow-lg">Pick</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
