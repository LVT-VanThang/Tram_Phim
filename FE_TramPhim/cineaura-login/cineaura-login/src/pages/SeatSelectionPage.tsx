import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createBooking,
  enrichPaymentForCheckout,
  isPaymentUsable,
  PAYMENT_FLOW_STORAGE_KEY,
  type PaymentFlowState,
} from '../api/bookings';
import { fetchShowtimeById, fetchSeatsByShowtimeId, type ShowtimeSeatResponse } from '../api/showtimes';

function groupSeatsByRow(seats: ShowtimeSeatResponse[]): [string, ShowtimeSeatResponse[]][] {
  const map = new Map<string, ShowtimeSeatResponse[]>();
  for (const s of seats) {
    const row = s.rowLabel || '?';
    if (!map.has(row)) map.set(row, []);
    map.get(row)!.push(s);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.seatNumber - b.seatNumber || a.seatId - b.seatId);
  }
  return [...map.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }),
  );
}

function seatPrice(s: ShowtimeSeatResponse, fallback: number): number {
  return s.price != null && !Number.isNaN(s.price) ? s.price : fallback;
}

function rowTone(row: string, seats: ShowtimeSeatResponse[]): 'standard' | 'vip' | 'couple' {
  const t = seats[0]?.seatType;
  if (t === 'VIP') return 'vip';
  if (t === 'COUPLE') return 'couple';
  if (/^[fghij]/i.test(row)) return 'vip';
  if (/^l/i.test(row)) return 'couple';
  return 'standard';
}

export function SeatSelectionPage() {
  const { showtimeId: sid } = useParams();
  const showtimeId = Number(sid);
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState<Awaited<ReturnType<typeof fetchShowtimeById>> | null>(null);
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePrice = showtime?.basePrice != null && showtime.basePrice > 0 ? showtime.basePrice : 120000;

  useEffect(() => {
    if (!Number.isFinite(showtimeId) || showtimeId <= 0) {
      setError('Suất chiếu không hợp lệ');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [st, ss] = await Promise.all([
          fetchShowtimeById(showtimeId),
          fetchSeatsByShowtimeId(showtimeId),
        ]);
        if (!cancelled) {
          setShowtime(st);
          setSeats(ss);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Không tải được dữ liệu';
          setError(msg === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : msg === 'NOT_FOUND' ? 'NOT_FOUND' : msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showtimeId]);

  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  const toggleSeat = useCallback((s: ShowtimeSeatResponse) => {
    if (s.status !== 'AVAILABLE' && s.status !== 'UNKNOWN') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s.seatId)) next.delete(s.seatId);
      else next.add(s.seatId);
      return next;
    });
  }, []);

  const selectedList = useMemo(
    () => seats.filter((s) => selected.has(s.seatId)),
    [seats, selected],
  );

  const total = useMemo(
    () => selectedList.reduce((sum, s) => sum + seatPrice(s, basePrice), 0),
    [selectedList, basePrice],
  );

  const formatMoney = (n: number) =>
    n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

  const onContinue = useCallback(async () => {
    if (selected.size === 0) {
      alert('Vui lòng chọn ít nhất một ghế.');
      return;
    }
    setBooking(true);
    try {
      const res = await createBooking({
        showtimeId,
        seatIds: [...selected],
      });
      const priceFallback = res.totalPrice ?? total;
      if (res.bookingId == null) {
        alert('Server không trả bookingId — không thể mở trang thanh toán. Kiểm tra response POST /api/bookings.');
        navigate(showtime ? `/phim/${showtime.movieId}` : '/phim');
        return;
      }
      const payment = enrichPaymentForCheckout(res.payment, res.bookingId, priceFallback) ?? res.payment;
      if (!isPaymentUsable(payment, priceFallback)) {
        alert(
          'Đơn đã tạo nhưng thiếu dữ liệu thanh toán (STK, nội dung CK, số tiền). Cập nhật backend trả object payment (PaymentInfo), hoặc đặt VITE_CHECKOUT_ACCOUNT_NUMBER trong file .env (production bắt buộc).',
        );
        navigate(showtime ? `/phim/${showtime.movieId}` : '/phim');
        return;
      }
      const payState: PaymentFlowState = {
        bookingId: res.bookingId,
        showtimeId: res.showtimeId ?? showtimeId,
        movieId: showtime?.movieId,
        movieTitle: showtime?.movieTitle,
        showDate: showtime?.showDate,
        startTime: showtime?.startTime,
        formatLabel: showtime?.formatLabel,
        seatLabels: selectedList.map((s) => s.label),
        message: res.message,
        totalPrice: priceFallback,
        payment,
      };
      try {
        sessionStorage.setItem(PAYMENT_FLOW_STORAGE_KEY, JSON.stringify(payState));
      } catch {
        /* ignore */
      }
      navigate('/thanh-toan', { state: payState });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Đặt vé thất bại');
    } finally {
      setBooking(false);
    }
  }, [navigate, selected, selectedList, showtime, showtimeId, total]);

  if (!Number.isFinite(showtimeId) || showtimeId <= 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-on-surface-variant">Suất không hợp lệ.</p>
        <Link className="text-primary font-bold" to="/phim">
          Về danh sách phim
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-40">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-container-high/30">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={showtime ? `/phim/${showtime.movieId}` : '/phim'}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0"
              aria-label="Quay lại"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </Link>
            <div className="min-w-0">
              <h1 className="font-headline text-base sm:text-lg font-bold tracking-tight text-on-surface truncate">
                Chọn ghế
              </h1>
              <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium truncate">
                CineAura Bright
                {showtime?.screenName ? ` • ${showtime.screenName}` : ''}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right min-w-0 max-w-[50%]">
            <span className="text-sm font-bold text-primary truncate">{showtime?.movieTitle ?? '—'}</span>
            <span className="text-xs text-on-surface-variant truncate">
              {showtime?.showDate ?? ''}
              {showtime?.startTime ? ` • ${showtime.startTime}` : ''}
              {showtime?.formatLabel ? ` • ${showtime.formatLabel}` : ''}
            </span>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-8">
        {loading && (
          <div className="flex justify-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
          </div>
        )}

        {error === 'UNAUTHORIZED' && (
          <div className="text-center py-16">
            <p className="text-on-surface-variant mb-4">Cần đăng nhập để xem ghế và đặt vé.</p>
            <Link className="text-primary font-bold underline" to="/login">
              Đăng nhập
            </Link>
          </div>
        )}

        {error && error !== 'UNAUTHORIZED' && (
          <div className="text-center py-16">
            <p className="text-error font-medium mb-4">
              {error === 'NOT_FOUND' ? 'Không tìm thấy suất chiếu.' : error}
            </p>
            <Link className="text-primary font-bold" to="/phim">
              Về danh sách phim
            </Link>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-col items-center mb-12">
              <div className="screen-curve-bar rounded-full mb-3" />
              <span className="font-headline text-[10px] tracking-[0.3em] uppercase text-outline font-bold">
                Màn hình
              </span>
            </div>

            {rows.length === 0 ? (
              <p className="text-center text-on-surface-variant py-12">
                Chưa có dữ liệu ghế cho suất này. Kiểm tra API{' '}
                <code className="text-xs bg-surface-container-high px-1 rounded">/api/showtimes/{showtimeId}/seats</code>
              </p>
            ) : (
              <div className="seat-grid-perspective overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="min-w-[min(100%,720px)] flex flex-col items-center gap-3 mx-auto">
                  {rows.map(([rowLabel, rowSeats]) => {
                    const tone = rowTone(rowLabel, rowSeats);
                    return (
                      <div key={rowLabel} className="flex items-center gap-4 sm:gap-6 w-full justify-center">
                        <span
                          className={`w-4 text-[10px] font-bold shrink-0 ${tone === 'vip' ? 'text-tertiary' : tone === 'couple' ? 'text-secondary' : 'text-outline'}`}
                        >
                          {rowLabel}
                        </span>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {rowSeats.map((s) => {
                            const taken = s.status === 'BOOKED' || s.status === 'OCCUPIED' || s.status === 'DISABLED';
                            const isSelected = selected.has(s.seatId);
                            const isCouple = s.seatType === 'COUPLE' || tone === 'couple';
                            const isVip = s.seatType === 'VIP' || tone === 'vip';

                            if (taken) {
                              return (
                                <div
                                  key={s.id}
                                  className={`${isCouple ? 'min-w-[4.5rem] px-2' : 'w-8'} h-8 rounded-lg bg-surface-dim/50 flex items-center justify-center text-outline-variant text-[10px] cursor-not-allowed`}
                                  title="Đã đặt"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </div>
                              );
                            }

                            const base =
                              isVip
                                ? 'bg-tertiary-container/30 border border-tertiary/15 text-tertiary-dim hover:bg-tertiary-container/50'
                                : isCouple
                                  ? 'bg-secondary-container/50 border border-secondary/20 text-on-secondary-container hover:bg-secondary-container/70 min-w-[4.5rem] px-2'
                                  : 'bg-surface-container-highest hover:bg-surface-dim text-on-surface';

                            return (
                              <button
                                key={s.id}
                                type="button"
                                title={s.label}
                                onClick={() => toggleSeat(s)}
                                className={`${isCouple ? 'min-w-[4.5rem] px-2' : 'w-8'} h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                                    : base
                                }`}
                              >
                                {isCouple ? s.label || `Đôi ${s.seatNumber}` : String(s.seatNumber || s.label)}
                              </button>
                            );
                          })}
                        </div>
                        <span
                          className={`w-4 text-[10px] font-bold shrink-0 text-right ${tone === 'vip' ? 'text-tertiary' : tone === 'couple' ? 'text-secondary' : 'text-outline'}`}
                        >
                          {rowLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4 py-6 bg-surface-container-lowest rounded-3xl border border-surface-container-high/20">
              <LegendItem color="bg-surface-container-highest" label="Thường (trống)" />
              <LegendItem
                color="bg-tertiary-container/30 border border-tertiary/10"
                label="VIP"
              />
              <LegendItem
                color="bg-secondary-container/50 border border-secondary/20"
                label="Couple / đôi"
              />
              <LegendItem color="bg-primary" label="Đang chọn" />
              <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-surface-dim/50 flex items-center justify-center text-outline-variant">
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">Đã đặt</span>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 border-t border-surface-container-high/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
                Ghế đã chọn
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedList.length === 0 ? (
                  <span className="text-xs text-on-surface-variant">Chưa chọn ghế</span>
                ) : (
                  selectedList.map((s) => (
                    <span
                      key={s.seatId}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20"
                    >
                      {s.label}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-surface-container-high shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
                Tổng cộng
              </span>
              <span className="text-2xl font-black text-on-surface tracking-tighter">
                {formatMoney(total)}{' '}
                <span className="text-sm font-bold text-primary">VNĐ</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled={booking || selected.size === 0}
            onClick={() => void onContinue()}
            className="w-full md:w-64 bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-headline font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{booking ? 'Đang xử lý…' : 'Tiếp tục'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-md shrink-0 ${color}`} />
      <span className="text-xs font-medium text-on-surface-variant leading-tight">{label}</span>
    </div>
  );
}
