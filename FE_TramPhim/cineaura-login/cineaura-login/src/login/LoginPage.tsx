import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import { storeSession } from '../auth/session';

type LoginLocationState = {
  fromRegister?: boolean;
  registerMessage?: string;
  prefilledUsername?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerNotice, setRegisterNotice] = useState<string | null>(null);

  useEffect(() => {
    const s = location.state as LoginLocationState | null;
    if (!s?.fromRegister) return;
    setRegisterNotice(s.registerMessage ?? 'Đăng ký thành công! Vui lòng đăng nhập.');
    if (s.prefilledUsername) setUsername(s.prefilledUsername);
  }, [location.key, location.state]);

 async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setRegisterNotice(null);
    setLoading(true);
    try {
      const data = await loginApi(username.trim(), password);
      storeSession(remember, data);
      window.dispatchEvent(new Event('cineaura-session'));

      // ========================================================
      // 🌟 KIỂM TRA QUYỀN ĐỂ CHUYỂN TRANG (CHUẨN TYPESCRIPT 100%)
      // ========================================================
      
      // Kiểm tra xem mảng roles từ Java trả về có chứa quyền ADMIN không
      const isAdmin = data.roles && (data.roles.includes('ADMIN') || data.roles.includes('ROLE_ADMIN'));

      if (isAdmin) {
        // Nếu tài khoản có quyền Admin -> Bay thẳng vào trang Quản trị
        navigate('/admin', { replace: true });
      } else {
        // Nếu chỉ là User bình thường -> Về trang chủ mua vé
        navigate('/', { replace: true });
      }
      
      // ========================================================

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4 md:p-0">
      <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row min-h-[870px] bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
        <div className="hidden md:flex md:w-1/2 relative min-h-[520px] flex-col overflow-hidden bg-neutral-950 p-8 md:p-10">
          <div className="absolute inset-0 z-0">
            <img
              alt=""
              className="h-full w-full object-contain object-center"
              src="https://img3.stockfresh.com/files/s/sgursozlu/m/80/4608921_stock-vector-cinema-poster-design-template.jpg"
              referrerPolicy="no-referrer"
              decoding="async"
            />
          </div>
          <div className="relative z-10 shrink-0 space-y-2">
            <Link
              to="/"
              className="inline-block text-white text-2xl md:text-3xl font-black tracking-tight brand hover:opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]"
            >
              CineAura Bright
            </Link>
            <p className="max-w-[16rem] text-sm font-semibold leading-snug text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
              Đặt vé — chọn ghế — thanh toán nhanh.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-10 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <Link to="/" className="text-primary text-3xl font-black tracking-tight brand">
                CineAura Bright
              </Link>
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Đăng nhập</h2>
            <p className="text-on-surface-variant font-medium">
              Đặt vé, chọn ghế và thanh toán nhanh — đăng nhập để tiếp tục.
            </p>
          </div>

          {registerNotice && (
            <div className="mb-6 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm font-medium text-on-primary-container">
              {registerNotice}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl bg-error/10 border border-error/30 px-4 py-3 text-sm font-medium text-error">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface ml-1" htmlFor="email">
                Tên đăng nhập hoặc email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                  mail
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none text-on-surface font-medium placeholder:text-outline-variant"
                  id="email"
                  placeholder="username hoặc email"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
                <a className="text-xs font-bold text-primary hover:text-primary-dim transition-colors" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none text-on-surface font-medium placeholder:text-outline-variant"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-1">
              <input
                className="w-5 h-5 rounded-lg border-surface-variant text-primary focus:ring-primary/20 transition-all"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              className="w-full signature-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container-high" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-container-lowest text-outline-variant font-medium">Hoặc đăng nhập với</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-8 w-full flex items-center justify-center gap-3 py-3.5 border border-outline-variant/25 rounded-2xl hover:bg-surface-container-low transition-colors duration-200 group"
            onClick={() => alert('Tích hợp Google OAuth sẽ được bổ sung sau.')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-bold text-on-surface">Google</span>
          </button>

          <div className="mt-12 text-center">
            <p className="text-on-surface-variant font-medium">
              Chưa có tài khoản?{' '}
              <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" to="/register">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-auto pt-8 flex items-center justify-center gap-6 text-xs font-semibold text-outline-variant tracking-wider uppercase">
            <a className="hover:text-primary transition-colors" href="#">
              Điều khoản
            </a>
            <span className="w-1 h-1 bg-surface-variant rounded-full" />
            <a className="hover:text-primary transition-colors" href="#">
              Bảo mật
            </a>
            <span className="w-1 h-1 bg-surface-variant rounded-full" />
            <a className="hover:text-primary transition-colors" href="#">
              Liên hệ
            </a>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          className="bg-tertiary-container text-on-tertiary-container p-4 rounded-full shadow-xl flex items-center gap-2 font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">support_agent</span>
          <span className="hidden md:inline">Hỗ trợ 24/7</span>
        </button>
      </div>

      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-8 hidden md:block">
        <div className="flex justify-between items-center py-2 opacity-50">
          <p className="font-['Inter'] text-xs text-slate-500">© 2024 CineAura Bright. Đặt vé xem phim trực tuyến.</p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-lg">local_movies</span>
            <span className="material-symbols-outlined text-lg">stadium</span>
            <span className="material-symbols-outlined text-lg">confirmation_number</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
