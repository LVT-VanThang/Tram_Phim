import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth';

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
          <div className="hidden md:flex md:col-span-5 relative items-center justify-center overflow-hidden min-h-[600px]">
            <div className="absolute inset-0 z-0">
              <img
                alt="Cinematic Experience"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBAuaTtUatCqV7zsNx1KPD1quxTM3ptKGXJAAycX3A7RoICqY6Zby-MRLsXT5NoGXlBj0DfdQvn3oPYD8ZDB5ODtMAlwzwLUHDJTfkX3B6EPjh-KCl3wiWEuTULsnX2fA7v8pBY3YBVUah2cWJEkRIwev-lb5sfwPagpzfXMIh8Zvh8EVNFWNrctbPt1aWMmsCE5yitefkMYRg-DCXR3OBUVIfTULESeLqGK-0tnjMKR4HfL-yv4aeOA5SuS_XPK4e2xM7fYrH5HGe"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-12 text-on-primary">
              <div className="mb-8">
                <Link
                  to="/"
                  className="text-4xl font-headline font-black tracking-tighter text-white hover:opacity-90"
                >
                  CineAura Bright
                </Link>
              </div>
              <h1 className="text-4xl font-headline font-bold leading-tight mb-4 tracking-tight">
                Hào quang của sự thuần khiết.
              </h1>
              <p className="text-lg opacity-90 max-w-sm font-light">
                Bắt đầu hành trình khám phá thế giới điện ảnh đỉnh cao với trải nghiệm đặt vé hiện đại nhất.
              </p>
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9rJHAM2mVHfhr9F9HeIuGPAnfuspZvGPa4lGbNY1dzmhi-_j3icLDMLIuLN_HwCNShAqw-XrbJ4wAw6LytAVNprBxtKCi4MZ6LTLswHQfi0sNe2WwEuysTeg1oBl7E0kEfUojukX3I1aJ-Q_ynyFYgcJ2rKfgYk07l638UGJH-69U54y9_o3CFr7JGkIhRD879WPcPukFZ2yaiNDSOMh2OHQBfzvxwChIJ3-buiwvlLYSTqpG2guyaR1JUbCX4PJyyB2yEqa0oOs3"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxJnyKAFYl-8OK4nGPFxUTwRcCn08CiAcOeE4zYillRjXSPjOPWTB-CQCJaorgi9t3NjN151KKhl1CWemJqe8MGh3v36NzjHNCj8HhBiopTPf8YLNuxZv9mwGxGSq9r66-rYVpVY_xV692_U1y1b-4gwJUDUxBuHWyg28-Cg9IJbtZI145tOTIlIK4sTMhdG57lWBO1xZrnFBrMuEPuW-4kgJCOrk3mZ0hLgBZ4ewb1r2Z6xsuXwVtSm4vp13ImMz-UybBvb2s7DXC"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAURArzErQxOobVDU6O6KiLDF3RJlBnATXyhZeiGbAIEQAUHwZI_F28YhpBrgUqKuBibagTA9vHOEojdzECAhAwnMXe3glxrmE7ybLpEcwgnfsSkmw4O9J4KTwvV_pZPr-ufIHsV3oSkrrM_5fuZI56Mxxudtr-GB5nKJsUMbZDTCtrsL4gNHhGG8cTq2sAVw3PEw9e9dwjqFU7KFmNxlpF8TXHB66klrGJD5-EEuirMID0oLnfQipw4ArqYSwC0XOIrSVuhLMEf13A"
                  />
                </div>
                <span className="text-sm font-medium">+10k thành viên CineAura</span>
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

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-container-highest" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface-container-lowest px-4 text-outline-variant font-medium">
                    HOẶC TIẾP TỤC VỚI
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface font-medium group"
                  onClick={() => alert('Tích hợp Google OAuth sẽ được bổ sung sau.')}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface font-medium group"
                  onClick={() => alert('Tích hợp Facebook OAuth sẽ được bổ sung sau.')}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

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
