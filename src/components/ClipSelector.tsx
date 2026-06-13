'use client';

import { useState, useEffect } from 'react';
import { Play, RefreshCcw, Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { GifSheet } from './ui/GifSheet';

interface ClipSelectorProps {
  movieTitle: string;
  onSelect: (clipUrl: string | null) => void;
  onBack: () => void;
  selectedClipUrl: string | null;
}

export default function ClipSelector({ movieTitle, onSelect, onBack, selectedClipUrl }: ClipSelectorProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localSelectedUrl, setLocalSelectedUrl] = useState<string | null>(selectedClipUrl);
  const [isLoadingInitial, setIsLoadingInitial] = useState(!selectedClipUrl);

  // Initial fetch for the first clip if none selected
  useEffect(() => {
    if (!selectedClipUrl && !localSelectedUrl) {
      const initialFetch = async () => {
        try {
          const response = await fetch(`/api/clips?q=${encodeURIComponent(movieTitle)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            setLocalSelectedUrl(data[0].src);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingInitial(false);
        }
      };
      initialFetch();
    } else {
      setIsLoadingInitial(false);
    }
  }, [movieTitle, selectedClipUrl, localSelectedUrl]);

  const handleSheetSelect = (url: string) => {
    setLocalSelectedUrl(url);
    setIsSheetOpen(false);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[60vh]">
      <div className="flex-1 space-y-8 pb-32">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center font-serif">
            <Heart className="h-4 w-4 text-accent mr-2 fill-current" />
            Find a Moment
          </h2>
          <Button variant="ghost" size="sm" onClick={onBack} className="text-[10px] font-serif opacity-50 hover:opacity-100 uppercase">
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <p className="text-[10px] font-serif text-gray-500 uppercase tracking-[0.2em]">Current Preview</p>
          
          <div 
            onClick={() => setIsSheetOpen(true)}
            className="group relative aspect-video w-full bg-secondary/20 border-2 border-accent/10 hover:border-accent hover:marquee-glow transition-all duration-300 overflow-hidden cursor-pointer shadow-xl rounded-md"
          >
            {localSelectedUrl ? (
              <>
                <video
                  key={localSelectedUrl}
                  src={localSelectedUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-4 py-2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest flex items-center rounded-sm">
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    Change Moment
                  </div>
                </div>
              </>
            ) : isLoadingInitial ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-serif uppercase tracking-widest text-gray-400">Archiving moments...</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-gray-400">
                <Play className="w-8 h-8 opacity-20" />
                <p className="text-[10px] font-serif uppercase tracking-widest">No selection</p>
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-[7px] font-mono uppercase tracking-widest text-white/60 rounded-sm">
              Scene via KLIPY
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full border-accent/20 hover:border-accent" onClick={() => setIsSheetOpen(true)}>
              {localSelectedUrl ? 'Browse More Moments' : 'Find a Moment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button with Gradient */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-background via-background to-transparent pt-12">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          <Button 
            className="w-full shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90"
            size="lg"
            disabled={!localSelectedUrl}
            onClick={() => onSelect(localSelectedUrl)}
          >
            Next: Final Note
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-400 text-[10px] font-serif uppercase tracking-widest hover:text-accent"
            onClick={() => onSelect(null)}
          >
            Skip / Silent Moment
          </Button>
        </div>
      </div>

      <GifSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={handleSheetSelect}
        movieTitle={movieTitle}
      />
    </div>
  );
}
