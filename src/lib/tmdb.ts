const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_ACCESS_TOKEN) {
    console.warn('TMDB_ACCESS_TOKEN is not defined');
    return [];
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('TMDB API Error:', error);
    throw new Error('Failed to fetch from TMDb');
  }

  const data = await response.json();
  return data.results || [];
}

export function getTMDBImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
