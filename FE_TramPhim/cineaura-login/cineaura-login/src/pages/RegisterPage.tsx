import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth';

const REGISTER_AD_IMAGES = [
  'https://ilo.edu.vn/wp-content/uploads/turbo-1536x960.jpeg',
  'https://ilo.edu.vn/wp-content/uploads/91u9Q8tSI3L._AC_UF10001000_QL80_.jpg',
  'https://ilo.edu.vn/wp-content/uploads/moana-maui-disney-1536x992.webp',
  'https://cellphones.com.vn/sforum/wp-content/uploads/2023/02/phim-hai-hay-4.jpg',
  'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/2/10/1146258/Titanic-2-01.jpeg',
] as const;

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adSlideIndex, setAdSlideIndex] = useState(0);
  const adDirectionRef = useRef(1);

  useEffect(() => {
    const intervalMs = 4500;
    const id = window.setInterval(() => {
      setAdSlideIndex((i) => {
        const d = adDirectionRef.current;
        const next = i + d;
        if (next >= REGISTER_AD_IMAGES.length) {
          adDirectionRef.current = -1;
          return i - 1;
        }
        if (next < 0) {
          adDirectionRef.current = 1;
          return i + 1;
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi({
        username: username.trim(),
        password,
        email: email.trim(),
        full_name: name.trim(),
        phone: phone.trim() || undefined,
      });
      navigate('/login', {
        replace: true,
        state: {
          fromRegister: true,
          registerMessage: data.message,
          prefilledUsername: data.username,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      <main className="min-h-screen flex items-center justify-center p-4 md:p-8 flex-1">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-surface-container-lowest rounded-xl shadow-sm">
          <div className="hidden md:flex md:col-span-5 relative overflow-hidden min-h-[min(88vh,920px)] bg-black">
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              {REGISTER_AD_IMAGES.map((src, idx) => (
                <img
                  key={src}
                  alt=""
                  className={`absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-contain object-center transition-opacity duration-700 ease-in-out ${
                    idx === adSlideIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  src={src}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              ))}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[55%] bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                aria-hidden
              />
            </div>
            <div className="relative z-10 box-border flex min-h-[min(88vh,920px)] flex-col justify-between p-12 text-on-primary [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_2px_24px_rgba(0,0,0,0.5)]">
              <div>
                <div className="mb-8">
                  <Link
                    to="/"
                    className="text-4xl font-headline font-black tracking-tighter text-white hover:opacity-90"
                  >
                    CineAura Bright
                  </Link>
                </div>
                <h1 className="text-3xl sm:text-4xl font-headline font-bold leading-tight mb-3 tracking-tight">
                  Đặt vé, chọn ghế, thanh toán nhanh.
                </h1>
                <p className="text-base sm:text-lg opacity-90 max-w-sm font-light leading-snug">
                  Tạo tài khoản để giữ suất và thanh toán gọn trên web.
                </p>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {REGISTER_AD_IMAGES.map((_, idx) => (
                    <button
                      key={REGISTER_AD_IMAGES[idx]}
                      type="button"
                      aria-label={`Ảnh nền ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === adSlideIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      onClick={() => setAdSlideIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                <div className="md:hidden mb-6">
                  <Link to="/" className="text-2xl font-headline font-black text-primary tracking-tighter">
                    CineAura Bright
                  </Link>
                </div>
                <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
                  Đăng ký tài khoản
                </h2>
                <p className="text-on-surface-variant">Chào mừng bạn gia nhập cộng đồng yêu điện ảnh.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl bg-error/10 border border-error/30 px-4 py-3 text-sm font-medium text-error">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="username">
                    Tên đăng nhập
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                    id="username"
                    name="username"
                    placeholder="aura_user"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="name">
                    Họ tên
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                    id="phone"
                    name="phone"
                    placeholder="09xxxxxxxx (tuỳ chọn)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                    id="email"
                    name="email"
                    placeholder="aura@cinebright.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="password">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-semibold text-on-surface-variant ml-1"
                      htmlFor="confirm-password"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        className="w-full px-5 py-3.5 rounded-xl border-none bg-surface-container-high text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 outline-none"
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="••••••••"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="w-full signature-gradient text-white font-headline font-bold py-4 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Đang đăng ký…' : 'Đăng ký ngay'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-on-surface-variant font-medium">
                  Đã có tài khoản?{' '}
                  <Link
                    className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all"
                    to="/login"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 px-6 text-center">
        <p className="text-sm text-outline-variant font-body">
          © 2024 CineAura Bright. Hào quang của sự thuần khiết.
        </p>
      </footer>
    </div>
  );
}
