'use client';

import { useState, useEffect, useCallback, useDeferredValue } from 'react';
import { Movie } from '@/lib/tmdb';
import { Search, Heart } from 'lucide-react';
import { Input } from './ui/Input';
import { Skeleton } from './ui/Skeleton';
import MoviePoster from './MoviePoster';

interface MovieSearchProps {
  onSelect: (movie: Movie) => void;
}

export default function MovieSearch({ onSelect }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recent_movies');
    if (stored) {
      try {
        setRecentMovies(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelect = (movie: Movie) => {
    const updated = [movie, ...recentMovies.filter(m => m.id !== movie.id)].slice(0, 3);
    setRecentMovies(updated);
    localStorage.setItem('recent_movies', JSON.stringify(updated));
    onSelect(movie);
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search movies.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(deferredQuery);
  }, [deferredQuery, performSearch]);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center">
          <Heart className="h-4 w-4 text-accent mr-2 fill-current" />
          Find a Film
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <Input
            type="text"
            className="pl-12 bg-paper border-accent/10 focus:border-accent"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-accent text-[10px] font-mono uppercase tracking-widest">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))
        ) : (
          results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleSelect(movie)}
              className="group text-left space-y-2 focus:outline-none active:scale-95 transition-all duration-75"
            >
              <MoviePoster 
                posterPath={movie.poster_path} 
                movieTitle={movie.title} 
                className="rounded-md shadow-sm group-hover:shadow-md border-accent/5 group-hover:border-accent/40"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest line-clamp-1 group-hover:text-accent transition-colors">
                  {movie.title}
                </p>
                <p className="text-[10px] font-mono text-gray-400">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {!isLoading && results.length === 0 && recentMovies.length > 0 && !query.trim() && (
        <div className="space-y-4 pt-4 border-t border-accent/10">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Recent Explorations</p>
          <div className="flex flex-wrap gap-2">
            {recentMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleSelect(movie)}
                className="px-3 py-1.5 bg-paper border border-accent/10 text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:border-accent hover:text-accent transition-all rounded-full active:scale-95 shadow-sm"
              >
                {movie.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {deferredQuery && !isLoading && results.length === 0 && (
        <div className="text-center py-12 space-y-4">
           <Heart className="mx-auto h-8 w-8 text-accent/10" />
           <p className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">
            No matches in the archive
          </p>
        </div>
      )}
    </div>
  );
}
