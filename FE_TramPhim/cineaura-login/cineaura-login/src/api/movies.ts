import { getStoredToken } from '../auth/session';

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'https://be-tram-phim.onrender.com').replace(/\/+$/, '');

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const j = JSON.parse(text) as { message?: string; error?: string };
    return j.message ?? j.error ?? fallback;
  } catch {
    return text.slice(0, 200) || fallback;
  }
}

export type Genre = { id: number; name: string };

export type Movie = {
  id: number;
  title: string;
  description?: string | null;
  duration?: number | null;
  posterUrl?: string | null;
  releaseDate?: string | null;
  genres: { id: number; name: string }[];
};

function pickId(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

function normalizeGenre(g: Record<string, unknown>): { id: number; name: string } {
  const id = pickId(g, 'genre_id', 'genreId') ?? 0;
  const name = String(g.genre_name ?? g.genreName ?? '');
  return { id, name };
}

function normalizeMovie(raw: Record<string, unknown>): Movie {
  const id = pickId(raw, 'movie_id', 'movieId') ?? 0;
  const genresRaw = raw.genres;
  const genres = Array.isArray(genresRaw)
    ? genresRaw.map((g) => normalizeGenre(g as Record<string, unknown>))
    : [];
  return {
    id,
    title: String(raw.title ?? ''),
    description: raw.description != null ? String(raw.description) : null,
    duration: raw.duration != null ? Number(raw.duration) : null,
    posterUrl:
      raw.poster_url != null
        ? String(raw.poster_url)
        : raw.posterUrl != null
          ? String(raw.posterUrl)
          : null,
    releaseDate:
      raw.release_date != null
        ? String(raw.release_date)
        : raw.releaseDate != null
          ? String(raw.releaseDate)
          : null,
    genres,
  };
}

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${apiBase}/api/movies`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được danh sách phim');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeMovie(item as Record<string, unknown>));
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${apiBase}/api/genres`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được thể loại');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const g = item as Record<string, unknown>;
    return {
      id: pickId(g, 'genre_id', 'genreId') ?? 0,
      name: String(g.genre_name ?? g.genreName ?? ''),
    };
  });
}
