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
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4 md:p-0">
      <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row min-h-[870px] bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
        <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Cinematic Experience"
              className="w-full h-full object-cover brightness-75 scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNAFm7koP9H7VP-Dn57wqSfLg7wOYU4-C5oykHpog8VxeuZ15OUmXKHHYp3_5PRv_4YQ08kuQ9gJWh0y1kfBrJ8xgKkL0MDDh5e2kZNIXsQdM6c26YNBUjgxZM_hjy9ennAIDcSheNmp9nu7jpT3HALY-XX0Svf4kJGRG3DTPzdAVpTulhCA7REiFC6Co1qT3dbXImlvBol7Be2z9JHj70GM97ps9n-n_mmkxo26pbQPpZKLBDrlyuvOFyUu21YgtdZyNYTiengBka"
            />
            <div className="absolute inset-0 signature-gradient opacity-40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <Link to="/" className="text-white text-3xl font-black tracking-tighter brand hover:opacity-90">
                CineAura
              </Link>
            </div>
            <h1 className="text-white text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Khám phá <br />
              Hào quang <br />
              Điện ảnh.
            </h1>
            <p className="text-on-primary/90 text-lg font-medium max-w-md">
              Trải nghiệm đặt vé thông minh, hiện đại và tinh tế nhất dành cho những tín đồ yêu phim thực thụ.
            </p>
          </div>
          <div className="relative z-10 glass-effect p-6 rounded-2xl border border-white/20 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhljPn93u1HJ9r5LWNYlDoBusQhxXZ0BOWG3ry78wwGcCanTNb37qXT_qxy07tsOQaJarS5KpLe3pwF6FEaLQe-9kbO8eaZ7TAeQPWGSITtgtVsZiPHCPaDpnctXNJ5oDIWf3wtr-6ng-1n2u6qRT7-Jo8TV0-0GuaFkhcHj7dt9UeSFIWk4SuSgGDsX1d8Mo-q641s1sWbvhQ95xKX9wkkGKFIu8UMKJ0aBCguW-mvW1pbSlO7XxnI4KlpA6PZxkuTr-NaspTGpKh"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhzBndhICcPA6qKzfHG-NG60Kz3K6KqUIimSY68CIdvuNiRKY-RV-pBJpQk6WRNtSja1OFkn9yZSD5x_7Uj6o8iBXz4aeSzrsuyHsGWptuomffFPLXyXTy3qRmgWrjk0muRQFirApzZ3Qb8pm-DxyhmuaitUMcG6HSQ0KXzNb-5QmFfFoIblKsOJrsIiUZovRr1T_7J42H8tcLoNVLrz80fl0Ee0198RU2S6Aj30EIjOZ0I8gg5gBM27fosn2BrT9UhLkDJmu3w2RL"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCokjbqfLFzzGCsJ3e2QzMIz_szrA2ibU50UVk_83gPfenM7xpDCAMmNIoBJ7CoJ32MuZCSOhqOH2bYLGPb1VxBJBqndkrzBXsMQmNnuMyR-Gm65UWM4uhHfg_n-zCWcM7AIUGlSY9YzHDp4lmCx663WKkVE2ZKp8kCEUQFZnkIE9NpMHJHJ0nWeTnKBLg_S71F2hso_oVfFHVt77Mi2kGyLoxDM4H9gDYzXMGn94aoaqaO09E_pAKe5PAnmB34bnJK0tSFJ197vp-O"
              />
            </div>
            <p className="text-on-surface-variant text-sm font-medium">
              Tham gia cùng <span className="text-primary font-bold">10,000+</span> thành viên CineAura ngay hôm nay.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <Link to="/" className="text-primary text-3xl font-black tracking-tighter brand">
                CineAura
              </Link>
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Chào mừng trở lại</h2>
            <p className="text-on-surface-variant font-medium">Hãy đăng nhập để tiếp tục hành trình điện ảnh của bạn.</p>
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
              <span className="px-4 bg-white text-outline-variant font-medium">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-2xl hover:bg-surface-container-low transition-colors duration-200 group"
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
            <button
              type="button"
              className="flex items-center justify-center gap-3 py-3 border border-outline-variant/20 rounded-2xl hover:bg-surface-container-low transition-colors duration-200 group"
              onClick={() => alert('Tích hợp Facebook OAuth sẽ được bổ sung sau.')}
            >
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-bold text-on-surface">Facebook</span>
            </button>
          </div>

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
          <p className="font-['Inter'] text-xs text-slate-500">© 2024 CineAura. Trải nghiệm điện ảnh thuần khiết.</p>
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
