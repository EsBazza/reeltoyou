'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface EntryFormProps {
  movieTitle: string;
  quoteText: string;
  characterName?: string;
  onSubmit: (data: { recipientName: string; dedication: string }) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function EntryForm({
  movieTitle,
  quoteText,
  characterName,
  onSubmit,
  onBack,
  isLoading,
  error
}: EntryFormProps) {
  const [recipientName, setRecipientName] = useState('');
  const [dedication, setDedication] = useState('');

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return;
    onSubmit({ recipientName, dedication });
  };

  return (
    <div className="w-full flex flex-col min-h-[60vh]">
      <div className="flex-1 space-y-8 pb-32">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold italic tracking-tighter text-foreground">The Final Note</h2>
          <Button variant="ghost" size="sm" onClick={onBack} disabled={isLoading} className="text-[10px] font-serif opacity-50 hover:opacity-100 uppercase">
            Back
          </Button>
        </div>

        <div className="p-6 bg-secondary/20 border border-accent/10 space-y-4 shadow-sm rounded-md bg-paper-texture">
          <div className="space-y-1">
            <p className="text-[10px] font-serif text-accent uppercase tracking-widest font-bold">The Chosen Moment</p>
            <p className="font-serif italic text-lg leading-tight text-foreground">&quot;{quoteText}&quot;</p>
            {characterName && <p className="text-[10px] font-serif text-gray-400 uppercase tracking-widest">— {characterName}, {movieTitle}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-400">Who is this for?</label>
                <span className="text-[8px] font-serif uppercase text-accent/60 tracking-widest italic">A name makes it searchable</span>
              </div>
              <Input
                required
                disabled={isLoading}
                placeholder="Recipient name..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                maxLength={50}
                autoFocus
                className="bg-paper border-accent/10 focus:border-accent font-serif"
              />
              <p className="text-[10px] text-gray-400 font-serif italic">
                Choose a name they will recognize in the archive.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-serif uppercase tracking-[0.2em] text-gray-400">Your secret message (Optional)</label>
              <textarea
                className="w-full bg-paper border-2 border-accent/10 px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-none text-foreground rounded-md font-serif italic"
                placeholder="Write a little something from the heart..."
                disabled={isLoading}
                value={dedication}
                onFocus={handleTextareaFocus}
                onChange={(e) => setDedication(e.target.value)}
                maxLength={200}
              />
              <p className="text-right text-[10px] font-serif text-gray-400">
                {dedication.length}/200
              </p>
            </div>
          </div>

        {error && (
          <div className="p-4 bg-accent/10 border border-accent/20 text-accent text-[10px] font-serif uppercase tracking-widest text-center rounded-sm">
            {error.includes('language') ? "Let's keep it classic – please rephrase." : error}
          </div>
        )}
        </form>
        
        <p className="text-center text-[10px] font-serif text-gray-400 uppercase tracking-widest leading-loose">
          Every moment you share is public and permanent.<br />
          Choose your words with care.
        </p>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-background via-background to-transparent pt-12">
        <div className="max-w-lg mx-auto">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!recipientName.trim()}
            className="w-full shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 rounded-md"
            size="lg"
            onClick={handleSubmit}
          >
            Send this moment
          </Button>
        </div>
      </div>
    </div>
  );
}
