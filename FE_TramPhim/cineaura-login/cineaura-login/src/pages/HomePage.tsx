import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { fetchMovies, type Movie } from '../api/movies';
import { clearSession, getStoredSession } from '../auth/session';

const POSTER_FALLBACK =
  'https://placehold.co/480x720/eef1f4/595c5e?text=CineAura&font=source-sans-pro';

/** Dùng khi API lỗi hoặc chưa đủ 3 phim — khớp dữ liệu mẫu từ backend */
const FALLBACK_SPOTLIGHT: Movie[] = [
  {
    id: 1,
    title: 'Avengers',
    description: 'Marvel movie',
    duration: 120,
    posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    releaseDate: '2024-01-01',
    genres: [
      { id: 1, name: 'Phiêu lưu' },
      { id: 2, name: 'Hành động' },
    ],
  },
  {
    id: 2,
    title: 'Titanic',
    description: 'Love story',
    duration: 150,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    releaseDate: '2023-05-10',
    genres: [
      { id: 3, name: 'Tình cảm' },
      { id: 4, name: 'Chính kịch' },
    ],
  },
  {
    id: 3,
    title: 'Conjuring',
    description: 'Horror movie',
    duration: 110,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    releaseDate: '2022-10-01',
    genres: [{ id: 5, name: 'Kinh dị' }],
  },
];

function genreLine(m: Movie): string {
  if (m.genres?.length) return m.genres.map((g) => g.name).join(' · ');
  const t = m.title.toLowerCase();
  if (t.includes('avenger')) return 'Phiêu lưu · Hành động';
  if (t.includes('titanic')) return 'Tình cảm · Chính kịch';
  if (t.includes('conjur')) return 'Kinh dị';
  return 'Phim hay';
}

function pickPoster(m: Movie): string {
  const u = m.posterUrl?.trim();
  if (u && /^https?:\/\//i.test(u)) return u;
  return POSTER_FALLBACK;
}

const HERO_BANNER_IMAGES = [
  'https://thuonghieuvaphapluat.vn/Images/hoangduc/2023/02/13/01.jpg',
  'https://cellphones.com.vn/sforum/wp-content/uploads/2022/03/1-43.jpg',
  'https://genk.mediacdn.vn/thumb_w/640/2019/12/9/anh-1-15759025807712116411603.jpg',
] as const;

export function HomePage() {
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredSession());
  const [spotlight, setSpotlight] = useState<Movie[]>(FALLBACK_SPOTLIGHT);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const heroSlideDirRef = useRef(1);

  useEffect(() => {
    const ms = 5000;
    const id = window.setInterval(() => {
      setHeroSlideIndex((i) => {
        const d = heroSlideDirRef.current;
        const next = i + d;
        if (next >= HERO_BANNER_IMAGES.length) {
          heroSlideDirRef.current = -1;
          return i - 1;
        }
        if (next < 0) {
          heroSlideDirRef.current = 1;
          return i + 1;
        }
        return next;
      });
    }, ms);
    return () => window.clearInterval(id);
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
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchMovies();
        if (cancelled) return;
        if (list.length >= 3) {
          setSpotlight(list.slice(0, 3));
        } else if (list.length > 0) {
          const seen = new Set(list.map((m) => m.id));
          const pad = FALLBACK_SPOTLIGHT.filter((m) => !seen.has(m.id));
          setSpotlight([...list, ...pad].slice(0, 3));
        }
      } catch {
        if (!cancelled) setSpotlight(FALLBACK_SPOTLIGHT);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    window.dispatchEvent(new Event('cineaura-session'));
  }, []);

  const displayName = user?.full_name?.trim() || user?.email || 'Thành viên';

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <Link className="text-2xl font-black text-blue-600 tracking-tighter font-headline" to="/">
              CineAura
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                className="text-blue-600 font-bold border-b-2 border-blue-600 font-headline tracking-tight transition-colors duration-200"
                to="/"
              >
                Trang chủ
              </Link>
              <Link
                className="text-slate-600 font-medium font-headline tracking-tight hover:text-blue-500 transition-colors duration-200"
                to="/phim"
              >
                Phim
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <input
                className="bg-surface-container-high border-none rounded-full py-2 px-6 pl-12 text-sm focus:ring-2 focus:ring-primary w-64 transition-all outline-none"
                placeholder="Tìm kiếm phim..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end max-w-full">
              {user ? (
                <>
                  <Link
                    to="/ho-so"
                    className="text-sm font-medium text-slate-700 hover:text-primary transition-colors text-right sm:text-left max-w-[min(100vw-8rem,28rem)] sm:max-w-md lg:max-w-xl xl:max-w-2xl"
                    title="Xem thông tin cá nhân"
                  >
                    <span className="text-slate-500">Xin chào,</span>{' '}
                    <span className="font-semibold text-slate-800 break-words">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                    aria-label="Đăng xuất"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex px-3 sm:px-4 py-2 rounded-full font-semibold text-slate-600 hover:text-primary transition-colors text-sm sm:text-base"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-blue-600 scale-95 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    <span>Đăng nhập</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative px-4 sm:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
          <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-black isolate shadow-lg shadow-black/15 ring-1 ring-white/5">
            <div className="relative w-full h-[min(46vh,440px)] min-h-[220px] sm:min-h-[260px] sm:h-[min(48vh,480px)]">
              {HERO_BANNER_IMAGES.map((src, idx) => (
                <img
                  key={src}
                  alt=""
                  className={`absolute inset-0 m-auto h-full w-full object-contain object-center transition-opacity duration-500 ease-out ${
                    idx === heroSlideIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  src={src}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  sizes="(min-width: 1280px) 1152px, (min-width: 768px) 92vw, 100vw"
                />
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[46%] max-h-[280px] bg-gradient-to-t from-black/70 from-15% via-black/25 via-50% to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col gap-4 p-6 pb-7 sm:p-8 sm:pb-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div className="min-w-0 max-w-xl space-y-3">
                  <span className="inline-block px-2.5 py-0.5 bg-white/70 text-slate-900 rounded text-[10px] font-semibold tracking-wide uppercase">
                    Đặt vé online
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/60 font-headline tracking-tight leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    Suất đang mở — đặt trên điện thoại
                  </h1>
                  <p className="text-sm sm:text-base text-white/45 max-w-md font-normal leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    Chọn phim, giờ chiếu và ghế; thanh toán xong nhận mã vé qua email.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {HERO_BANNER_IMAGES.map((_, idx) => (
                      <button
                        key={HERO_BANNER_IMAGES[idx]}
                        type="button"
                        aria-label={`Banner ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === heroSlideIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/75'
                        }`}
                        onClick={() => setHeroSlideIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-row items-center justify-end gap-2.5 self-end">
                  <Link
                    to="/phim"
                    className="inline-flex justify-center px-6 py-3 rounded-full font-bold text-base transition-colors flex items-center gap-2 whitespace-nowrap border border-white/40 bg-black/35 text-white hover:bg-black/50"
                  >
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                    Lịch chiếu
                  </Link>
                  <Link
                    to="/phim"
                    className="inline-flex justify-center px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-base hover:bg-white/90 transition-colors flex items-center gap-2 whitespace-nowrap shadow-md shadow-black/20"
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      confirmation_number
                    </span>
                    Đặt vé ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-4 max-w-7xl mx-auto flex gap-4 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            className="px-6 py-2 bg-primary text-white rounded-full font-bold whitespace-nowrap"
          >
            Tất cả
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-surface-container-lowest text-on-surface rounded-full font-semibold whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            Hành động
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-surface-container-lowest text-on-surface rounded-full font-semibold whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            Tâm lý
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-surface-container-lowest text-on-surface rounded-full font-semibold whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            Hoạt hình
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-surface-container-lowest text-on-surface rounded-full font-semibold whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            Kinh dị
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-surface-container-lowest text-on-surface rounded-full font-semibold whitespace-nowrap hover:bg-surface-container transition-colors"
          >
            Viễn tưởng
          </button>
        </section>

        <section className="px-8 py-16 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface leading-none">
                Phim Đang Chiếu
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Khám phá những siêu phẩm điện ảnh mới nhất tại rạp.</p>
            </div>
            <Link className="text-primary font-bold flex items-center gap-1 group" to="/phim">
              Xem tất cả
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {spotlight[0] && <SpotlightFeatureCard movie={spotlight[0]} />}
            {spotlight[1] && <SpotlightSideCard movie={spotlight[1]} />}
            {spotlight[2] && <SpotlightSideCard movie={spotlight[2]} />}
          </div>
        </section>

        <section className="bg-surface-container-low py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface">Phim Sắp Chiếu</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Trước"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-sm hover:shadow-md transition-shadow"
                  aria-label="Sau"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8 -mx-4 px-4">
              <ComingSoonCard
                title="Joker: Folie à Deux"
                meta="Tâm lý, Âm nhạc"
                date="04.10.2024"
                poster="https://lh3.googleusercontent.com/aida-public/AB6AXuD3oaOfwi-fCSHZGEiWS5IkYz9HMuTt9-STHJ7lEBkmzRIqva9szuwSvRtrdfr767e1UWHF7eNfY24vNK2LKGyMkmVWTCq_-iu-zr9CNEhX_cBf2hoWmAy1lmRH0mdqAUVrzRQRDz0DuKjPxMoFnLt9ySpTMZ2dA8wV02pc8kPx3UsHHradMMKi5lqxGywjqzq56FCgojXAucFhUXZFwIG79afgcX8XE88SvuICw3R6V5sR_fMu1ESd66o-5yfuLorhZtX3MbsmVo0P"
              />
              <ComingSoonCard
                title="Võ Sĩ Giác Đấu II"
                meta="Hành động, Sử thi"
                date="22.11.2024"
                poster="https://lh3.googleusercontent.com/aida-public/AB6AXuBTBjJD2oVwwNQmAkeop3a15LQQ8ova0ABcUDj32CdisUb5TdDFWGFYT3q98KLREcC6zqkPLZGKEXtzA9m5wzdeud2xMSFFGU5yFfFxRyhV12F_r61SC7iH1T69fUFBQEOZsaPpMqIBwWSnaQMDXNzNuExc4ywo6RDPP17t-uGTLUORciTY7GFU1JqDLogPfhIvVtDBIcT5ZmuR8y6rhI-mGUu9f6JjleBGlFM9BUQ6DYpy-PRtewO5eoRJqf_n-_L66m9nzz-LyPZ0"
              />
              <ComingSoonCard
                title="Hành Trình Của Moana 2"
                meta="Hoạt hình, Phiêu lưu"
                date="27.11.2024"
                poster="https://lh3.googleusercontent.com/aida-public/AB6AXuCgAXA1rrBaRDUACE-WUbrZULSEeQlQ8oLuTuWRf1JzJA28aAWe6mWbIGhKHYukyH3KXJi9DN2Sot75XXlQocXSjQu-zsdKzye_mDZLhqhFq0fIMh5fp5Bg6iqNOppkoHCrNNzqKOYEx5OA9qzG5PfHFRO_G3TeCozv1ivllqxDqeTSIK2z8Z5lRyJbg03T1jy-zCtvOvAt_qpY7_jz6vZmO84kcsrDhJHD8Mp7dxdY0mK7omiBPhOJu645VkwVO3E7vetuJsTK69lc"
              />
              <ComingSoonCard
                title="Deadpool & Wolverine"
                meta="Hành động, Hài hước"
                date="26.07.2024"
                poster="https://lh3.googleusercontent.com/aida-public/AB6AXuCSuxbj6C_FJZOXck_7jl1ixKs0zLNEdw0fUAC2XcnM4PKUDy1lnk1pB9z6Gu65cmSeFl7UY-IjgMAeFTcVGALMaK-HQi4IWM9m9lzLF8W4ToD2dTv8UGUkB0LTym9FsvGMrtukoaBct4Erx--B5sHyHXeY3OvWGiYXDyJCTsZmO1YEUXO5wJGbEoAD-BimE3gjt6g6gdMUqv1wzJ3E2rM_IJn1-dKDWkDF5yrjSQxegTxD36NaoLaIimsHpbF408YkxYK-yz6t2HHF"
              />
            </div>
          </div>
        </section>

        <section className="px-8 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface mb-12">Ưu Đãi Đặc Biệt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-primary text-white group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4">celebration</span>
                <h3 className="text-2xl font-bold font-headline mb-4">Ngày Hội Thành Viên</h3>
                <p className="text-white/80 mb-8 font-medium">
                  Giảm giá 50% cho tất cả các loại vé vào thứ Hai hàng tuần.
                </p>
                <button
                  type="button"
                  className="bg-white text-primary px-6 py-2 rounded-full font-bold hover:bg-secondary-fixed transition-colors"
                >
                  Tìm hiểu thêm
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-[12rem]">confirmation_number</span>
              </div>
            </div>
            <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-br from-tertiary to-tertiary-dim text-white group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4">fastfood</span>
                <h3 className="text-2xl font-bold font-headline mb-4">Combo Bắp Nước Hời</h3>
                <p className="text-white/80 mb-8 font-medium">
                  Nhận ngay ưu đãi khi mua kèm vé xem phim trực tuyến.
                </p>
                <button
                  type="button"
                  className="bg-white text-tertiary px-6 py-2 rounded-full font-bold hover:bg-secondary-fixed transition-colors"
                >
                  Tìm hiểu thêm
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-[12rem]">restaurant</span>
              </div>
            </div>
            <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-black text-white group">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4">workspace_premium</span>
                <h3 className="text-2xl font-bold font-headline mb-4">Nâng Cấp VIP</h3>
                <p className="text-white/80 mb-8 font-medium">
                  Trải nghiệm phòng chiếu hạng thương gia với giá phổ thông.
                </p>
                <button
                  type="button"
                  className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-secondary-fixed transition-colors"
                >
                  Tìm hiểu thêm
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-[12rem]">theaters</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-20">
          <div className="max-w-7xl mx-auto bg-surface-container-lowest rounded-[3rem] p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center border border-primary/5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface mb-6 relative z-10">
              Đừng bỏ lỡ bất kỳ bộ phim nào
            </h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium mb-12 relative z-10">
              Đăng ký nhận thông tin về các bộ phim mới nhất, ưu đãi độc quyền và sự kiện tại CineAura.
            </p>
            <form
              className="flex flex-col md:flex-row gap-4 w-full max-w-lg relative z-10"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                className="flex-grow bg-white border border-outline-variant rounded-full px-8 py-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="Địa chỉ email của bạn"
                type="email"
              />
              <button
                type="submit"
                className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Tham gia ngay
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 w-full pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            <Link className="text-3xl font-bold text-blue-600 font-headline tracking-tighter" to="/">
              CineAura
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed">
              © 2024 CineAura. Trải nghiệm điện ảnh thuần khiết. Chúng tôi mang đến những giây phút giải trí tuyệt vời nhất với công nghệ chiếu phim hiện đại.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
                href="#"
                aria-label="Facebook"
              >
                <span className="material-symbols-outlined text-lg">social_leaderboard</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors"
                href="#"
                aria-label="Email"
              >
                <span className="material-symbols-outlined text-lg">alternate_email</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold font-headline text-lg mb-6">Liên kết nhanh</h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Hệ thống rạp
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Tin tức điện ảnh
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold font-headline text-lg mb-6">Hỗ trợ khách hàng</h4>
            <ul className="space-y-4">
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Chính sách hoàn vé
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-blue-600 underline-offset-4 font-medium transition-opacity opacity-80 hover:opacity-100"
                  href="#"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-sm">© 2024 CineAura. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

function SpotlightFeatureCard({ movie }: { movie: Movie }) {
  const poster = pickPoster(movie);
  const g = genreLine(movie);
  const dur = movie.duration != null ? `${movie.duration} phút` : '—';

  return (
    <Link
      to={`/phim/${movie.id}`}
      className="md:col-span-2 md:row-span-2 group relative block overflow-hidden rounded-[2rem] bg-surface-container-lowest ring-1 ring-black/5 shadow-md"
    >
      <img
        className="w-full h-full min-h-[300px] md:min-h-[440px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        alt={movie.title}
        src={poster}
        onError={(e) => {
          const el = e.currentTarget;
          if (el.dataset.fb === '1') return;
          el.dataset.fb = '1';
          el.src = POSTER_FALLBACK;
        }}
      />
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-black/55 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white">
          {g}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {dur}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-6 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28">
        <h3 className="mb-2 font-headline text-2xl font-bold text-white md:text-3xl">{movie.title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-white/85">{movie.description?.trim() || g}</p>
        <span className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-center text-sm font-bold text-white md:w-auto md:px-8">
          Đặt vé
        </span>
      </div>
    </Link>
  );
}

function SpotlightSideCard({ movie }: { movie: Movie }) {
  const poster = pickPoster(movie);
  const g = genreLine(movie);
  const dur = movie.duration != null ? `${movie.duration} phút` : '—';

  return (
    <Link
      to={`/phim/${movie.id}`}
      className="group overflow-hidden rounded-[2rem] bg-surface-container-lowest transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={movie.title}
          src={poster}
          onError={(e) => {
            const el = e.currentTarget;
            if (el.dataset.fb === '1') return;
            el.dataset.fb = '1';
            el.src = POSTER_FALLBACK;
          }}
        />
        <div className="absolute left-3 top-3 flex max-w-[90%] flex-col gap-1.5">
          <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {g}
          </span>
          <span className="inline-flex w-fit items-center gap-0.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-on-surface">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {dur}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-1 font-headline text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {g} · {dur}
        </p>
      </div>
    </Link>
  );
}

function ComingSoonCard({
  title,
  meta,
  date,
  poster,
}: {
  title: string;
  meta: string;
  date: string;
  poster: string;
}) {
  return (
    <div className="min-w-[300px] group">
      <div className="aspect-[2/3] rounded-[2rem] overflow-hidden mb-6 relative">
        <img
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          alt={title}
          src={poster}
        />
        <div className="absolute bottom-6 left-6">
          <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-on-surface">
            {date}
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold font-headline text-on-surface mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 font-medium">{meta}</p>
    </div>
  );
}
