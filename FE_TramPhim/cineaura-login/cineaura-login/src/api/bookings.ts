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

export type PaymentInfo = {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  ticketUnitPrice?: number;
  quantity?: number;
  amount?: number;
  amountVnd?: number;
  transferContent?: string;
  qrImageUrl?: string;
  /** Khớp backend VietQR — dùng dựng URL khi thiếu qrImageUrl */
  vietQrBankId?: string;
  qrTemplate?: string;
  paymentDescription?: string;
};

export const PAYMENT_FLOW_STORAGE_KEY = 'tramphim:paymentFlow';

/** Số tiền VND dùng cho QR: ưu tiên amountVnd → amount → tổng đơn từ API */
export function resolvePaymentAmountVnd(p: PaymentInfo | undefined | null, totalFallback?: number): number | undefined {
  if (p?.amountVnd != null && Number.isFinite(Number(p.amountVnd))) return Math.round(Number(p.amountVnd));
  if (p?.amount != null && Number.isFinite(Number(p.amount))) return Math.round(Number(p.amount));
  if (totalFallback != null && Number.isFinite(totalFallback)) return Math.round(totalFallback);
  return undefined;
}

/** Đủ để hiển thị trang thanh toán (QR trực tiếp hoặc dựng VietQR) */
export function isPaymentUsable(
  p: PaymentInfo | undefined | null,
  totalFallback?: number,
): boolean {
  if (!p) return false;
  if (p.qrImageUrl != null && String(p.qrImageUrl).trim() !== '') return true;
  const stk = p.accountNumber != null && String(p.accountNumber).trim() !== '';
  const nd = p.transferContent != null && String(p.transferContent).trim() !== '';
  const av = resolvePaymentAmountVnd(p, totalFallback);
  return stk && nd && av != null && av > 0;
}

/** Giống VietQrPaymentService (Java): img.vietqr.io + amount + addInfo */
export function buildVietQrImageUrl(p: PaymentInfo, totalFallback?: number): string | undefined {
  if (!isPaymentUsable(p, totalFallback)) return undefined;
  if (p.qrImageUrl != null && String(p.qrImageUrl).trim() !== '') return String(p.qrImageUrl).trim();

  const bankId =
    (p.vietQrBankId != null && String(p.vietQrBankId).trim()) ||
    (import.meta.env.VITE_VIETQR_BANK_ID as string | undefined)?.trim() ||
    'MBBank';
  const accountNumber = String(p.accountNumber).trim();
  const template = (p.qrTemplate != null && String(p.qrTemplate).trim()) || 'compact2';
  const amountVnd = resolvePaymentAmountVnd(p, totalFallback);
  if (amountVnd == null || amountVnd <= 0) return undefined;
  const addInfo = String(p.transferContent).trim();
  const base = `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png`;
  const q = new URLSearchParams();
  q.set('amount', String(amountVnd));
  q.set('addInfo', addInfo);
  const holder = p.accountHolder != null ? String(p.accountHolder).trim() : '';
  if (holder) q.set('accountName', holder);
  return `${base}?${q.toString()}`;
}

/** Truyền qua React Router `location.state` sau POST /api/bookings */
export type PaymentFlowState = {
  bookingId?: number;
  showtimeId?: number;
  movieId?: number;
  movieTitle?: string;
  showDate?: string;
  startTime?: string;
  formatLabel?: string;
  seatLabels?: string[];
  message?: string;
  totalPrice?: number;
  payment?: PaymentInfo;
  /** Ghi vào sessionStorage khi SePay webhook → BE trả status Paid */
  paymentConfirmed?: boolean;
  paidAt?: string;
};

export type BookingStatusDto = {
  bookingId?: number;
  status?: string;
  paidAt?: string;
};

export function isBookingPaidStatus(status: string | undefined): boolean {
  const s = status?.trim().toLowerCase();
  return s === 'paid' || s === 'completed';
}

export function markPaymentFlowAsPaidInStorage(bookingId: number, paidAt?: string) {
  try {
    const raw = sessionStorage.getItem(PAYMENT_FLOW_STORAGE_KEY);
    if (!raw) return;
    const o = JSON.parse(raw) as PaymentFlowState;
    if (o.bookingId !== bookingId) return;
    o.paymentConfirmed = true;
    o.paidAt = paidAt;
    sessionStorage.setItem(PAYMENT_FLOW_STORAGE_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

export type BookingResponse = {
  bookingId?: number;
  showtimeId?: number;
  seatIds?: number[];
  status?: string;
  message?: string;
  totalPrice?: number;
  payment?: PaymentInfo;
  error?: string;
};

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return undefined;
}

function pickNum(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v == null) continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parsePaymentInfo(raw: unknown): PaymentInfo | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  return {
    bankName: pickStr(o, 'bankName', 'bank_name'),
    accountNumber: pickStr(o, 'accountNumber', 'account_number'),
    accountHolder: pickStr(o, 'accountHolder', 'account_holder'),
    ticketUnitPrice: pickNum(o, 'ticketUnitPrice', 'ticket_unit_price'),
    quantity: pickNum(o, 'quantity'),
    amount: pickNum(o, 'amount'),
    amountVnd: pickNum(o, 'amountVnd', 'amount_vnd'),
    transferContent: pickStr(o, 'transferContent', 'transfer_content'),
    qrImageUrl: pickStr(o, 'qrImageUrl', 'qr_image_url'),
    vietQrBankId: pickStr(o, 'vietQrBankId', 'viet_qr_bank_id'),
    qrTemplate: pickStr(o, 'qrTemplate', 'qr_template'),
    paymentDescription: pickStr(o, 'paymentDescription', 'payment_description'),
  };
}

function parseSeatIds(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const ids = raw.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  return ids.length ? ids : undefined;
}

/** Một số API bọc body trong `data` */
function unwrapBookingJson(data: Record<string, unknown>): Record<string, unknown> {
  const inner = data.data ?? data.payload ?? data.result;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return data;
}

/**
 * Khi backend chưa trả `payment` (bản cũ / lỗi cấu hình), vẫn cho qua trang QR nếu có STK ở .env
 * và đủ số tiền — khớp nội dung CK `TramPhim {bookingId}` như VietQrPaymentService.
 */
export function enrichPaymentForCheckout(
  payment: PaymentInfo | undefined,
  bookingId: number,
  priceFallback: number,
): PaymentInfo | undefined {
  const av = resolvePaymentAmountVnd(payment, priceFallback);
  if (av == null || av <= 0) return payment;
  if (isPaymentUsable(payment, priceFallback)) return payment;

  const stkEnv =
    (import.meta.env.VITE_CHECKOUT_ACCOUNT_NUMBER as string | undefined)?.trim() ||
    (import.meta.env.DEV ? '0372036292' : undefined);
  const stk = payment?.accountNumber?.trim() || stkEnv;
  if (!stk) return payment;

  const transfer = payment?.transferContent?.trim() || `TramPhim ${bookingId}`;

  return {
    ...payment,
    bankName:
      payment?.bankName?.trim() ||
      (import.meta.env.VITE_CHECKOUT_BANK_NAME as string | undefined)?.trim() ||
      'Ngân hàng',
    accountNumber: stk,
    accountHolder:
      payment?.accountHolder?.trim() ||
      (import.meta.env.VITE_CHECKOUT_ACCOUNT_HOLDER as string | undefined)?.trim(),
    transferContent: transfer,
    amountVnd: payment?.amountVnd ?? av,
    amount: payment?.amount ?? av,
    paymentDescription:
      payment?.paymentDescription ||
      'Quét mã VietQR bằng app ngân hàng hoặc VNPay để chuyển khoản',
  };
}

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
  const root = unwrapBookingJson(data);
  const paymentRaw = root.payment ?? root.Payment ?? data.payment ?? data.Payment;
  return {
    bookingId: pickNum(root, 'bookingId', 'booking_id', 'id') ?? pickNum(data, 'bookingId', 'booking_id', 'id'),
    showtimeId: pickNum(root, 'showtimeId', 'showtime_id') ?? pickNum(data, 'showtimeId', 'showtime_id'),
    seatIds: parseSeatIds(root.seatIds ?? root.seat_ids ?? data.seatIds ?? data.seat_ids),
    status: pickStr(root, 'status') ?? pickStr(data, 'status'),
    message:
      root.message != null
        ? String(root.message)
        : data.message != null
          ? String(data.message)
          : undefined,
    totalPrice: pickNum(root, 'totalPrice', 'total_price') ?? pickNum(data, 'totalPrice', 'total_price'),
    payment: parsePaymentInfo(paymentRaw),
  };
}

export async function fetchBookingStatus(bookingId: number): Promise<BookingStatusDto> {
  const res = await fetch(`${apiBase}/api/bookings/${bookingId}/status`, {
    headers: authHeaders(),
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    if (text) data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const msg = (data.message as string) ?? text.slice(0, 160) ?? 'Không tải được trạng thái đơn';
    throw new Error(msg);
  }
  return {
    bookingId: pickNum(data, 'bookingId', 'booking_id'),
    status: pickStr(data, 'status'),
    paidAt: pickStr(data, 'paidAt', 'paid_at'),
  };
}

export type BookingHistoryItem = {
  bookingId?: number;
  status?: string;
  totalPrice?: number;
  createdAt?: string;
  paidAt?: string;
  showtimeId?: number;
  movieId?: number;
  movieTitle?: string;
  showDate?: string;
  startTime?: string;
  roomName?: string;
  seatLabels?: string[];
};

function parseHistoryItem(raw: Record<string, unknown>): BookingHistoryItem {
  const seatsRaw = raw.seatLabels ?? raw.seat_labels;
  const seatLabels = Array.isArray(seatsRaw)
    ? seatsRaw.map((x) => String(x)).filter((s) => s.length > 0)
    : undefined;
  return {
    bookingId: pickNum(raw, 'bookingId', 'booking_id'),
    status: pickStr(raw, 'status'),
    totalPrice: pickNum(raw, 'totalPrice', 'total_price'),
    createdAt: pickStr(raw, 'createdAt', 'created_at'),
    paidAt: pickStr(raw, 'paidAt', 'paid_at'),
    showtimeId: pickNum(raw, 'showtimeId', 'showtime_id'),
    movieId: pickNum(raw, 'movieId', 'movie_id'),
    movieTitle: pickStr(raw, 'movieTitle', 'movie_title'),
    showDate: pickStr(raw, 'showDate', 'show_date'),
    startTime: pickStr(raw, 'startTime', 'start_time'),
    roomName: pickStr(raw, 'roomName', 'room_name'),
    seatLabels,
  };
}

export async function fetchMyBookings(): Promise<BookingHistoryItem[]> {
  const res = await fetch(`${apiBase}/api/bookings/me`, {
    headers: authHeaders(),
  });
  const text = await res.text();
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    let msg = text.slice(0, 200);
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* keep msg */
    }
    throw new Error(msg || 'Không tải được lịch sử đặt vé');
  }
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : [];
  } catch {
    throw new Error('Phản hồi lịch sử đặt vé không hợp lệ');
  }
  if (!Array.isArray(data)) return [];
  return data.map((item) => parseHistoryItem(item as Record<string, unknown>));
}
