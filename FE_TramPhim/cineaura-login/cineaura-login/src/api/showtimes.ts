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

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return undefined;
}

export type ShowtimeResponse = {
  id: number;
  movieId: number;
  movieTitle: string;
  showDate: string;
  startTime: string;
  cinemaName: string;
  screenName: string;
  formatLabel: string;
  basePrice: number | null;
};

function normalizeShowtime(raw: Record<string, unknown>): ShowtimeResponse {
  const nestedMovie = raw.movie as Record<string, unknown> | undefined;
  const id = pickId(raw, 'showtimeId', 'showtime_id', 'id') ?? 0;
  const movieId =
    pickId(raw, 'movieId', 'movie_id') ?? pickId(nestedMovie ?? {}, 'movieId', 'movie_id', 'id') ?? 0;
  const movieTitle =
    pickStr(raw, 'movieTitle', 'movie_title', 'title') ??
    pickStr(nestedMovie ?? {}, 'title', 'movieTitle') ??
    'Phim';
  const showDate =
    pickStr(raw, 'showDate', 'show_date', 'date')?.slice(0, 10) ?? pickStr(raw, 'showtimeDate') ?? '';
  const startTime =
    pickStr(raw, 'startTime', 'start_time', 'time') ??
    (typeof raw.startLocalTime === 'string' ? String(raw.startLocalTime).slice(0, 5) : '') ??
    '';
  const cinemaName =
    pickStr(raw, 'cinemaName', 'cinema_name') ??
    pickStr((raw.cinema as Record<string, unknown>) ?? {}, 'name', 'cinemaName') ??
    'Rạp';
  const screenName =
    pickStr(raw, 'screenName', 'screen_name', 'roomName', 'room') ??
    pickStr((raw.screen as Record<string, unknown>) ?? {}, 'name') ??
    '';
  const formatLabel =
    pickStr(raw, 'format', 'formatLabel', 'subtitleFormat', 'projectionFormat') ?? '2D';
  const priceRaw = raw.basePrice ?? raw.price ?? raw.ticketPrice;
  const basePrice =
    priceRaw != null && !Number.isNaN(Number(priceRaw)) ? Number(priceRaw) : null;

  return {
    id,
    movieId,
    movieTitle,
    showDate,
    startTime,
    cinemaName,
    screenName,
    formatLabel,
    basePrice,
  };
}

export async function fetchShowtimesByMovieId(movieId: number): Promise<ShowtimeResponse[]> {
  const res = await fetch(`${apiBase}/api/showtimes/movie/${movieId}`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được suất chiếu');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeShowtime(item as Record<string, unknown>));
}

export async function fetchShowtimesByMovieIdAndDate(
  movieId: number,
  showDate: string,
): Promise<ShowtimeResponse[]> {
  const q = new URLSearchParams({ showDate });
  const res = await fetch(`${apiBase}/api/showtimes/movie/${movieId}/date?${q}`, {
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được suất theo ngày');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeShowtime(item as Record<string, unknown>));
}

export async function fetchShowtimeById(showtimeId: number): Promise<ShowtimeResponse> {
  const res = await fetch(`${apiBase}/api/showtimes/${showtimeId}`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được suất chiếu');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  return normalizeShowtime(data as Record<string, unknown>);
}

export type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'DISABLED' | 'UNKNOWN';

export type ShowtimeSeatResponse = {
  id: number;
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  status: SeatStatus;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE' | 'OTHER';
  price: number | null;
  label: string;
};

function normalizeSeatStatus(s: string): SeatStatus {
  const u = s.toUpperCase();
  if (u.includes('BOOK') || u.includes('OCCUP') || u.includes('TAKEN')) return 'BOOKED';
  if (u.includes('AVAIL') || u === 'FREE' || u === 'OPEN') return 'AVAILABLE';
  if (u.includes('DISABLE') || u.includes('BLOCK')) return 'DISABLED';
  return 'UNKNOWN';
}

function normalizeSeatType(s: string): ShowtimeSeatResponse['seatType'] {
  const u = s.toUpperCase();
  if (u.includes('VIP')) return 'VIP';
  if (u.includes('COUPLE') || u.includes('DOUBLE')) return 'COUPLE';
  if (u.includes('STANDARD') || u.includes('NORMAL') || u.includes('REGULAR')) return 'STANDARD';
  return 'OTHER';
}

export function normalizeShowtimeSeat(raw: Record<string, unknown>): ShowtimeSeatResponse {
  const seat = (raw.seat as Record<string, unknown>) ?? {};
  const id = pickId(raw, 'id', 'showtimeSeatId', 'showtime_seat_id') ?? 0;
  const seatId = pickId(raw, 'seatId', 'seat_id') ?? pickId(seat, 'seatId', 'seat_id', 'id') ?? id;
  const rowLabel =
    pickStr(raw, 'rowLabel', 'row', 'row_name') ??
    pickStr(seat, 'rowLabel', 'row', 'rowLetter', 'row_letter') ??
    '?';
  const seatNumber = Number(
    raw.seatNumber ?? raw.seat_number ?? seat.seatNumber ?? seat.number ?? seat.col ?? 0,
  );
  const status = normalizeSeatStatus(String(raw.status ?? raw.seatStatus ?? seat.status ?? 'AVAILABLE'));
  const seatType = normalizeSeatType(
    String(raw.seatType ?? raw.seat_type ?? seat.seatType ?? seat.type ?? 'STANDARD'),
  );
  const priceRaw = raw.price ?? raw.seatPrice ?? seat.price;
  const price = priceRaw != null && !Number.isNaN(Number(priceRaw)) ? Number(priceRaw) : null;
  const label =
    pickStr(raw, 'label', 'code') ?? (rowLabel && seatNumber ? `${rowLabel}${seatNumber}` : String(seatId));

  return { id, seatId, rowLabel, seatNumber, status, seatType, price, label };
}

export async function fetchSeatsByShowtimeId(showtimeId: number): Promise<ShowtimeSeatResponse[]> {
  const res = await fetch(`${apiBase}/api/showtimes/${showtimeId}/seats`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const msg = await parseErrorMessage(res, 'Không tải được ghế');
    throw new Error(msg);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeShowtimeSeat(item as Record<string, unknown>));
}
