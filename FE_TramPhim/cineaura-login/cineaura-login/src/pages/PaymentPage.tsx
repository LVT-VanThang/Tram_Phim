import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  buildVietQrImageUrl,
  fetchBookingStatus,
  isBookingPaidStatus,
  isPaymentUsable,
  markPaymentFlowAsPaidInStorage,
  PAYMENT_FLOW_STORAGE_KEY,
  type PaymentFlowState,
} from '../api/bookings';

function readStoredPaymentFlow(): PaymentFlowState | null {
  try {
    const s = sessionStorage.getItem(PAYMENT_FLOW_STORAGE_KEY);
    if (!s) return null;
    const o = JSON.parse(s) as PaymentFlowState;
    if (o?.bookingId != null && isPaymentUsable(o.payment, o.totalPrice)) return o;
  } catch {
    /* ignore */
  }
  return null;
}

function formatMoney(n: number) {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = useMemo((): PaymentFlowState | null => {
    const fromNav = location.state as PaymentFlowState | null;
    if (fromNav?.bookingId != null && isPaymentUsable(fromNav.payment, fromNav.totalPrice)) return fromNav;
    return readStoredPaymentFlow();
  }, [location.key, location.state]);

  const [copied, setCopied] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
  /** Đặt khi GET /api/bookings/:id/status trả Paid (sau webhook SePay) */
  const [webhookPaid, setWebhookPaid] = useState<{ paidAt?: string } | null>(() =>
    state?.paymentConfirmed ? { paidAt: state.paidAt } : null,
  );
  const [bookingCancelled, setBookingCancelled] = useState(false);
  const [pollAuthHint, setPollAuthHint] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  useEffect(() => {
    if (state?.paymentConfirmed && webhookPaid == null) {
      setWebhookPaid({ paidAt: state.paidAt });
    }
  }, [state?.paymentConfirmed, state?.paidAt, webhookPaid]);

  useEffect(() => {
    if (state?.bookingId == null) return;
    try {
      const prevRaw = sessionStorage.getItem(PAYMENT_FLOW_STORAGE_KEY);
      let merged: PaymentFlowState = { ...state };
      if (prevRaw) {
        const prev = JSON.parse(prevRaw) as PaymentFlowState;
        if (prev.bookingId === state.bookingId && prev.paymentConfirmed) {
          merged = { ...merged, paymentConfirmed: true, paidAt: prev.paidAt ?? merged.paidAt };
        }
      }
      if (webhookPaid != null) {
        merged = { ...merged, paymentConfirmed: true, paidAt: webhookPaid.paidAt ?? merged.paidAt };
      }
      sessionStorage.setItem(PAYMENT_FLOW_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }, [state, webhookPaid]);

  useEffect(() => {
    const id = state?.bookingId;
    if (id == null || webhookPaid != null || bookingCancelled) return;

    let stopped = false;
    let attempts = 0;
    const maxAttempts = 200;

    const tick = async () => {
      if (stopped) return;
      attempts += 1;
      if (attempts > maxAttempts) {
        setPollTimedOut(true);
        return;
      }
      try {
        const st = await fetchBookingStatus(id);
        if (stopped) return;
        const raw = st.status?.trim().toLowerCase() ?? '';
        if (isBookingPaidStatus(st.status)) {
          setWebhookPaid({ paidAt: st.paidAt });
          markPaymentFlowAsPaidInStorage(id, st.paidAt);
          return;
        }
        if (raw === 'cancelled') {
          setBookingCancelled(true);
          return;
        }
      } catch (e) {
        if (stopped) return;
        if (e instanceof Error && e.message === 'UNAUTHORIZED') {
          setPollAuthHint('Đăng nhập để trang tự chuyển sang “thanh toán thành công” khi SePay gửi webhook.');
          return;
        }
      }
      if (!stopped) window.setTimeout(tick, 3000);
    };

    void tick();
    return () => {
      stopped = true;
    };
  }, [state?.bookingId, webhookPaid, bookingCancelled]);

  const displayQrUrl = useMemo(() => {
    if (!state?.payment) return undefined;
    return buildVietQrImageUrl(state.payment, state.totalPrice);
  }, [state]);

  useEffect(() => {
    setQrFailed(false);
  }, [displayQrUrl]);

  const payment = state?.payment;
  const bookingId = state?.bookingId;
  const total = state?.totalPrice ?? payment?.amount ?? 0;

  const flashCopied = useCallback((key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  }, []);

  const onCopy = useCallback(
    async (key: string, text: string | undefined) => {
      if (!text) return;
      const ok = await copyText(text);
      if (ok) flashCopied(key);
    },
    [flashCopied],
  );

  const backTo = useMemo(() => {
    if (state?.movieId) return `/phim/${state.movieId}`;
    return '/phim';
  }, [state?.movieId]);

  if (!state || !bookingId || !payment || !isPaymentUsable(payment, state.totalPrice)) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col items-center justify-center gap-4 px-8 pb-24">
        <span className="material-symbols-outlined text-5xl text-outline">payments</span>
        <p className="text-center text-on-surface-variant max-w-md">
          Không có thông tin thanh toán. Có thể bạn đã tải lại trang hoặc liên kết không hợp lệ. Vui lòng chọn ghế và
          đặt vé lại.
        </p>
        <Link
          to="/phim"
          className="text-primary font-headline font-bold underline underline-offset-2"
        >
          Về danh sách phim
        </Link>
      </div>
    );
  }

  const paidAtDisplay = webhookPaid?.paidAt ?? state.paidAt;

  if (webhookPaid != null) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-container-high/30">
          <div className="flex items-center gap-3 px-4 sm:px-8 py-4 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0"
              aria-label="Quay lại"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <h1 className="font-headline text-base sm:text-lg font-bold text-on-surface">Thanh toán thành công</h1>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-primary">verified</span>
          </div>
          <p className="font-headline text-2xl font-black text-on-surface mb-2">Đã nhận thanh toán</p>
          <p className="text-on-surface-variant text-sm mb-1">
            Đơn vé <span className="font-bold text-primary">#{bookingId}</span> đã được xác nhận qua ngân hàng (SePay).
          </p>
          {state.movieTitle && (
            <p className="text-on-surface text-sm font-medium mb-4">{state.movieTitle}</p>
          )}
          {paidAtDisplay && (
            <p className="text-xs text-on-surface-variant mb-8">
              Thời điểm ghi nhận: <span className="font-mono text-on-surface">{paidAtDisplay}</span>
            </p>
          )}
          <p className="text-xs text-on-surface-variant mb-8 max-w-sm">
            Giữ email / tin nhắn từ rạp nếu có. Chúc bạn xem phim vui vẻ.
          </p>
          <Link
            to={backTo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-headline font-bold py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Về phim</span>
            <span className="material-symbols-outlined">movie</span>
          </Link>
          <Link to="/phim" className="mt-4 text-sm font-bold text-primary hover:underline">
            Danh sách phim
          </Link>
        </main>

        <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/8 blur-[120px] -z-10 rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-tertiary/8 blur-[100px] -z-10 rounded-full pointer-events-none" />
      </div>
    );
  }

  if (bookingCancelled) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col items-center justify-center gap-4 px-8 pb-24">
        <span className="material-symbols-outlined text-5xl text-outline">event_busy</span>
        <p className="text-center font-headline font-bold text-lg">Đơn không còn ở trạng thái chờ thanh toán</p>
        <p className="text-center text-on-surface-variant text-sm max-w-md">
          Có thể đơn đã hết hạn hoặc đã hủy. Vui lòng đặt vé lại.
        </p>
        <Link to={backTo} className="text-primary font-bold underline">
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-28">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-container-high/30">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors shrink-0"
              aria-label="Quay lại"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="font-headline text-base sm:text-lg font-bold tracking-tight text-on-surface truncate">
                Thanh toán chuyển khoản
              </h1>
              <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium truncate">
                Đơn #{bookingId} • CineAura Bright
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        <div className="rounded-2xl border border-surface-container-high/40 bg-surface-container-low/80 px-4 py-3 text-xs text-on-surface-variant flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">sync</span>
          <span>
            Đang chờ xác nhận từ ngân hàng… Trang sẽ tự chuyển sang <strong className="text-on-surface">Thanh toán thành công</strong> khi
            SePay gửi webhook và hệ thống cập nhật đơn.
          </span>
        </div>
        {pollAuthHint && (
          <div className="rounded-2xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error-dim">{pollAuthHint}</div>
        )}
        {pollTimedOut && (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
            Chưa thấy xác nhận trong thời gian chờ. Nếu đã chuyển khoản, vài phút sau hãy tải lại trang hoặc kiểm tra hồ
            sơ đặt vé.
          </div>
        )}
        {state.message && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-secondary-container">
            {state.message}
          </div>
        )}

        <section className="rounded-3xl bg-surface-container-lowest border border-surface-container-high/25 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-container-high/30 bg-surface-container-low/80">
            <h2 className="font-headline font-bold text-on-surface">Chi tiết vé</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {state.movieTitle ?? '—'}
              {state.showDate ? ` • ${state.showDate}` : ''}
              {state.startTime ? ` • ${state.startTime}` : ''}
              {state.formatLabel ? ` • ${state.formatLabel}` : ''}
            </p>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Ghế</span>
              <span className="font-bold text-on-surface text-right">
                {state.seatLabels?.length ? state.seatLabels.join(', ') : '—'}
              </span>
            </div>
            {payment.quantity != null && (
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Số lượng</span>
                <span className="font-medium">{payment.quantity} vé</span>
              </div>
            )}
            {payment.ticketUnitPrice != null && (
              <div className="flex justify-between gap-4">
                <span className="text-on-surface-variant">Đơn giá / vé</span>
                <span className="font-medium">{formatMoney(payment.ticketUnitPrice)} VNĐ</span>
              </div>
            )}
            <div className="h-px bg-surface-container-high/40" />
            <div className="flex justify-between gap-4 items-baseline">
              <span className="text-on-surface-variant font-bold uppercase text-[10px] tracking-wider">Tổng cộng</span>
              <span className="text-2xl font-black text-on-surface tracking-tight">
                {formatMoney(total)} <span className="text-sm font-bold text-primary">VNĐ</span>
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-container-lowest border border-surface-container-high/25 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-container-high/30">
            <h2 className="font-headline font-bold text-on-surface">Thông tin ngân hàng</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Chuyển khoản đúng số tiền và nội dung để hệ thống đối soát nhanh hơn.
            </p>
          </div>
          <div className="px-5 py-5 space-y-4">
            <FieldCopy
              label="Ngân hàng"
              value={payment.bankName}
              onCopy={() => {}}
              copiedKey="bank"
              activeKey={copied}
              hideCopy
            />
            <FieldCopy
              label="Số tài khoản"
              value={payment.accountNumber}
              onCopy={() => void onCopy('stk', payment.accountNumber)}
              copiedKey="stk"
              activeKey={copied}
            />
            {payment.accountHolder && (
              <FieldCopy
                label="Chủ tài khoản"
                value={payment.accountHolder}
                onCopy={() => void onCopy('name', payment.accountHolder)}
                copiedKey="name"
                activeKey={copied}
              />
            )}
            <FieldCopy
              label="Nội dung CK"
              value={payment.transferContent}
              onCopy={() => void onCopy('nd', payment.transferContent)}
              copiedKey="nd"
              activeKey={copied}
              mono
            />
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-b from-secondary-container/40 to-surface-container-lowest border border-secondary/15 p-6 text-center">
          <h2 className="font-headline font-bold text-on-secondary-container mb-1">Quét mã VietQR</h2>
          <p className="text-xs text-on-surface-variant mb-5 max-w-md mx-auto">
            {payment.paymentDescription ?? 'Quét mã bằng app ngân hàng hoặc VNPay để điền sẵn số tiền và nội dung.'}
          </p>
          <div className="inline-flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-lg shadow-primary/10 border border-surface-container-high/20">
            {!qrFailed && displayQrUrl ? (
              <img
                src={displayQrUrl}
                alt="Mã QR VietQR"
                className="w-52 h-52 sm:w-60 sm:h-60 object-contain"
                referrerPolicy="no-referrer"
                onError={() => setQrFailed(true)}
              />
            ) : (
              <div className="w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center gap-2 text-on-surface-variant text-sm px-4">
                <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                <span>
                  Không tải được ảnh QR. Chuyển khoản thủ công theo STK và nội dung phía trên, hoặc mở link ảnh bên
                  dưới.
                </span>
              </div>
            )}
            {displayQrUrl && (
              <a
                href={displayQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary hover:underline"
              >
                Mở ảnh mã QR (tab mới)
              </a>
            )}
          </div>
          {payment.amountVnd != null && (
            <p className="mt-4 text-[11px] text-on-surface-variant">
              Số tiền trên QR: <span className="font-bold text-on-surface">{formatMoney(payment.amountVnd)} VNĐ</span>
            </p>
          )}
        </section>

        <p className="text-center text-xs text-on-surface-variant pb-4">
          Sau khi chuyển khoản, đơn sẽ được xử lý theo quy trình hệ thống. Bạn có thể xem lại suất chiếu trong mục hồ sơ
          (nếu đã hỗ trợ).
        </p>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 border-t border-surface-container-high/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Cần đổi suất?</span>
            <p className="text-sm text-on-surface-variant">Quay lại phim để chọn lịch khác.</p>
          </div>
          <Link
            to={backTo}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-primary-fixed text-on-primary font-headline font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Hoàn tất</span>
            <span className="material-symbols-outlined text-xl">check</span>
          </Link>
        </div>
      </footer>

      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] -z-10 rounded-full pointer-events-none" />
    </div>
  );
}

function FieldCopy({
  label,
  value,
  onCopy,
  copiedKey,
  activeKey,
  mono,
  hideCopy,
}: {
  label: string;
  value?: string;
  onCopy: () => void;
  copiedKey: string;
  activeKey: string | null;
  mono?: boolean;
  hideCopy?: boolean;
}) {
  return (
    <div>
      <span className="text-[10px] uppercase font-bold text-outline tracking-wider">{label}</span>
      <div className="mt-1 flex items-stretch gap-2">
        <div
          className={`flex-1 min-w-0 rounded-xl bg-surface-container-high/40 border border-surface-container-high/50 px-3 py-2.5 text-sm font-semibold text-on-surface ${mono ? 'font-mono text-[13px] tracking-tight' : ''}`}
        >
          {value ?? '—'}
        </div>
        {!hideCopy && value && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 px-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs hover:bg-primary/15 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            {activeKey === copiedKey ? 'Đã chép' : 'Sao chép'}
          </button>
        )}
      </div>
    </div>
  );
}
