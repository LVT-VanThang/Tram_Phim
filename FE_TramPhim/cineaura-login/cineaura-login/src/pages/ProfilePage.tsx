import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { fetchMyBookings, type BookingHistoryItem } from '../api/bookings';
import { getStoredSession } from '../auth/session';

function statusBadge(status: string | undefined): { label: string; className: string } {
  const u = status?.trim().toLowerCase() ?? '';
  if (u === 'paid')
    return { label: 'Đã thanh toán', className: 'bg-primary/12 text-primary border-primary/25' };
  if (u === 'pending')
    return { label: 'Chờ thanh toán', className: 'bg-amber-100/90 text-amber-950 border-amber-200' };
  if (u === 'cancelled') return { label: 'Đã hủy', className: 'bg-surface-dim/80 text-on-surface-variant border-surface-container-high' };
  return { label: status?.trim() || '—', className: 'bg-surface-container-high text-on-surface border-surface-container-high' };
}

function formatMoney(n: number | undefined) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ`;
}

function shortTime(t: string | undefined) {
  if (!t) return '—';
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function ProfilePage() {
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredSession());
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!getStoredSession()) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const list = await fetchMyBookings();
      setBookings(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không tải được lịch sử';
      setBookingsError(msg === 'UNAUTHORIZED' ? 'Phiên hết hạn. Đăng nhập lại để xem vé đã đặt.' : msg);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    function sync() {
      setUser(getStoredSession());
    }
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('cineaura-session', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cineaura-session', sync);
    };
  }, []);

  useEffect(() => {
    if (user) void loadBookings();
  }, [user, loadBookings]);

  if (!user) {
    return <Navigate to="/login" replace state={{ fromProfile: true }} />;
  }

  const name = user.full_name?.trim() || '—';
  const email = user.email?.trim() || '—';
  const phone = user.phone?.trim() || '—';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface pb-12">
      <header className="border-b border-surface-container-high bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-primary font-headline font-bold text-lg hover:opacity-90">
            ← Trang chủ
          </Link>
          <h1 className="font-headline font-bold text-on-background text-lg">Thông tin cá nhân</h1>
          <span className="w-20" aria-hidden />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/50 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/90 to-primary-container/90 px-6 py-8 text-on-primary">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm opacity-90">Xin chào</p>
                <p className="text-xl font-headline font-bold truncate">{name}</p>
              </div>
            </div>
          </div>
          <dl className="divide-y divide-surface-container-high">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Họ và tên</dt>
              <dd className="text-on-background font-medium break-words">{name}</dd>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Email</dt>
              <dd className="text-on-background font-medium break-all">{email}</dd>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Số điện thoại</dt>
              <dd className="text-on-background font-medium">{phone}</dd>
            </div>
          </dl>
        </div>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Vé đã đặt</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">Lịch sử đơn vé của bạn trên CineAura Bright</p>
            </div>
            <button
              type="button"
              onClick={() => void loadBookings()}
              disabled={bookingsLoading}
              className="text-sm font-bold text-primary hover:underline disabled:opacity-50 self-start sm:self-auto"
            >
              {bookingsLoading ? 'Đang tải…' : 'Làm mới'}
            </button>
          </div>

          {bookingsError && (
            <div className="rounded-xl border border-error/30 bg-error/5 text-error-dim text-sm px-4 py-3 mb-4">
              {bookingsError}
            </div>
          )}

          {bookingsLoading && !bookings.length && !bookingsError && (
            <div className="flex justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
            </div>
          )}

          {!bookingsLoading && !bookings.length && !bookingsError && (
            <div className="rounded-2xl border border-dashed border-surface-container-high bg-surface-container-low/50 px-6 py-12 text-center text-on-surface-variant text-sm">
              Bạn chưa có đơn đặt vé nào.{' '}
              <Link to="/phim" className="font-bold text-primary hover:underline">
                Chọn phim
              </Link>
            </div>
          )}

          {bookings.length > 0 && (
            <ul className="space-y-4">
              {bookings.map((b, idx) => {
                const badge = statusBadge(b.status);
                const mid = b.movieId;
                return (
                  <li
                    key={b.bookingId ?? idx}
                    className="rounded-2xl border border-surface-container-high/50 bg-surface-container-lowest shadow-sm overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-surface-container-high/30 bg-surface-container-low/50">
                      <div className="min-w-0">
                        {mid != null ? (
                          <Link
                            to={`/phim/${mid}`}
                            className="font-headline font-bold text-on-surface hover:text-primary transition-colors line-clamp-2"
                          >
                            {b.movieTitle ?? 'Phim'}
                          </Link>
                        ) : (
                          <span className="font-headline font-bold text-on-surface">{b.movieTitle ?? 'Phim'}</span>
                        )}
                        <p className="text-xs text-on-surface-variant mt-1">
                          Mã đơn <span className="font-mono font-semibold text-on-surface">#{b.bookingId}</span>
                          {b.roomName ? ` · ${b.roomName}` : ''}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-on-surface-variant text-xs block mb-0.5">Suất chiếu</span>
                        <span className="font-medium">
                          {b.showDate ?? '—'} · {shortTime(b.startTime)}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block mb-0.5">Tổng tiền</span>
                        <span className="font-bold text-primary">{formatMoney(b.totalPrice)}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-on-surface-variant text-xs block mb-0.5">Ghế</span>
                        <span className="font-medium">
                          {b.seatLabels?.length ? b.seatLabels.join(', ') : '—'}
                        </span>
                      </div>
                      <div className="sm:col-span-2 text-xs text-on-surface-variant flex flex-wrap gap-x-4 gap-y-1">
                        <span>Đặt lúc: {b.createdAt ?? '—'}</span>
                        {b.paidAt && <span>Thanh toán: {b.paidAt}</span>}
                      </div>
                      {b.showtimeId != null && b.status?.toLowerCase() === 'pending' && (
                        <div className="sm:col-span-2 pt-1">
                          <Link
                            to={`/dat-ve/${b.showtimeId}`}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Tiếp tục thanh toán (chọn lại ghế nếu cần)
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="text-center text-sm text-on-surface-variant">
          Thông tin cá nhân lấy từ phiên đăng nhập. Lịch sử vé đồng bộ từ máy chủ.
        </p>
      </main>
    </div>
  );
}
