import { getStoredToken } from '../auth/session';

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'https://be-tram-phim.onrender.com').replace(/\/+$/, '');

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export type CreateBookingRequest = {
  showtimeId: number;
  seatIds: number[];
};

export type BookingResponse = {
  bookingId?: number;
  message?: string;
  totalPrice?: number;
  error?: string;
};

export async function createBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
  const res = await fetch(`${apiBase}/api/bookings`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      showtimeId: payload.showtimeId,
      seatIds: payload.seatIds,
    }),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    if (text) data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg =
      (data.message as string) ?? (data.error as string) ?? text.slice(0, 200) ?? 'Đặt vé thất bại';
    throw new Error(msg);
  }
  return {
    bookingId: Number(data.bookingId ?? data.booking_id ?? data.id) || undefined,
    message: data.message != null ? String(data.message) : undefined,
    totalPrice:
      data.totalPrice != null
        ? Number(data.totalPrice)
        : data.total_price != null
          ? Number(data.total_price)
          : undefined,
  };
}
