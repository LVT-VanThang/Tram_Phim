import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { fetchGenres, fetchMovies, type Movie } from '../api/movies';
import { clearSession, getStoredSession } from '../auth/session';

const PAGE_SIZE = 8;
const POSTER_FALLBACK =
  'https://placehold.co/480x720/eef1f4/595c5e?text=CineAura&font=source-sans-pro';

export function MovieListPage() {
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredSession());
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [genreId, setGenreId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredSession());
    }
    syncUser();

    function onAuthChange() {
      syncUser();
      setFetchKey((k) => k + 1);
    }
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('cineaura-session', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('cineaura-session', onAuthChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, g] = await Promise.all([fetchMovies(), fetchGenres()]);
        if (!cancelled) {
          setMovies(m);
          setGenres(g);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Không tải được dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((m) => {
      const matchTitle = !q || m.title.toLowerCase().includes(q);
      const gid = genreId ? Number(genreId) : NaN;
      const matchGenre =
        !genreId || Number.isNaN(gid) || (m.genres?.some((g) => g.id === gid) ?? false);
      return matchTitle && matchGenre;
    });
  }, [movies, query, genreId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, genreId]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    window.dispatchEvent(new Event('cineaura-session'));
  }, []);

  const displayName = user?.full_name?.trim() || user?.email || 'Thành viên';

  const applySearch = useCallback(() => {
    setPage(1);
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link className="text-2xl font-bold tracking-tighter text-blue-600 font-headline" to="/">
              CineAura
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                className="text-slate-600 font-headline font-semibold hover:text-blue-500 transition-colors duration-200"
                to="/"
              >
                Trang chủ
              </Link>
              <span className="text-blue-600 font-bold border-b-2 border-blue-600 font-headline">
                Phim
              </span>
              <a
                className="text-slate-600 font-headline font-semibold hover:text-blue-500 transition-colors duration-200"
                href="#"
              >
                Rạp
              </a>
              <a
                className="text-slate-600 font-headline font-semibold hover:text-blue-500 transition-colors duration-200"
                href="#"
              >
                Ưu đãi
              </a>
              <a
                className="text-slate-600 font-headline font-semibold hover:text-blue-500 transition-colors duration-200"
                href="#"
              >
                Thành viên
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/20 w-64 text-sm font-label outline-none"
                placeholder="Tìm kiếm phim..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {user ? (
              <>
                <span
                  className="hidden sm:inline text-sm font-medium text-slate-600 max-w-[120px] truncate"
                  title={displayName}
                >
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="hidden sm:inline px-3 py-2 rounded-full font-semibold text-slate-600 hover:text-primary transition-colors text-sm"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold font-headline transition-transform scale-95 active:scale-90"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-background mb-4">
            Khám phá Thế giới <span className="text-primary">Điện ảnh</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Hào quang của sự thuần khiết trong từng thước phim. Trải nghiệm xem phim cao cấp được tinh tuyển
            dành riêng cho bạn.
          </p>
        </header>

        <section className="mb-12 sticky top-24 z-40">
          <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-xl shadow-primary/5 flex flex-wrap lg:flex-nowrap items-center gap-4">
            <div className="flex-grow min-w-[240px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                movie
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-label placeholder:text-outline outline-none"
                placeholder="Nhập tên phim bạn muốn tìm..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-3 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-label text-sm text-on-surface-variant cursor-pointer min-w-[160px]"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  aria-label="Thể loại"
                >
                  <option value="">Tất cả thể loại</option>
                  {genres.map((g) => (
                    <option key={g.id} value={String(g.id)}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={applySearch}
              className="bg-primary hover:bg-primary-dim text-white px-8 py-3 rounded-2xl font-headline font-bold flex items-center gap-2 transition-all active:scale-95 ml-auto lg:ml-0"
            >
              <span className="material-symbols-outlined">search</span>
              Tìm kiếm
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-2xl bg-error-container/15 text-error px-4 py-3 text-sm font-medium">
            {error === 'UNAUTHORIZED' ? (
              <span>
                Cần đăng nhập để xem danh sách phim (API yêu cầu JWT).{' '}
                <Link className="font-bold underline underline-offset-2 hover:text-primary-dim" to="/login">
                  Đăng nhập
                </Link>
              </span>
            ) : (
              error
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
              <p className="font-medium">Đang tải danh sách phim...</p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {pageItems.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </section>

            {!filtered.length && !error && (
              <p className="text-center text-on-surface-variant py-16 font-medium">
                Không có phim phù hợp. Thử đổi từ khóa hoặc thể loại.
              </p>
            )}

            {filtered.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </main>

      <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col gap-4">
            <Link className="text-lg font-bold text-slate-900 font-headline" to="/">
              CineAura
            </Link>
            <p className="text-slate-500 text-sm max-w-xs">
              Hào quang của sự thuần khiết. Trải nghiệm điện ảnh đỉnh cao với CineAura Cinema.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#" aria-label="Web">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#" aria-label="Social">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#" aria-label="Video">
                <span className="material-symbols-outlined">smart_display</span>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm text-slate-900 font-headline">Khám phá</span>
              <a className="text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline text-sm" href="#">
                Về chúng tôi
              </a>
              <a className="text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline text-sm" href="#">
                Liên hệ
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm text-slate-900 font-headline">Chính sách</span>
              <a className="text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline text-sm" href="#">
                Điều khoản
              </a>
              <a className="text-slate-500 hover:text-blue-600 underline-offset-4 hover:underline text-sm" href="#">
                Chính sách bảo mật
              </a>
            </div>
          </div>
          <div className="text-slate-500 text-sm text-center md:text-right">
            © 2024 CineAura Cinema. Aura of Clarity Experience.
          </div>
        </div>
      </footer>
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = movie.posterUrl?.trim() || '';
  // Chỉ nhận URL http/https; nếu backend trả rỗng/invalid thì dùng fallback.
  const poster = posterUrl && /^https?:\/\//i.test(posterUrl) ? posterUrl : POSTER_FALLBACK;
  const durationLabel = movie.duration != null ? `${movie.duration} phút` : '—';
  const genreLabel =
    movie.genres?.length ? movie.genres.map((g) => g.name).join(', ') : 'Đang cập nhật';
  const tags = movie.genres?.slice(0, 3) ?? [];

  return (
    <div className="group relative bg-surface-container-lowest rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-2">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={poster}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.posterFallbackApplied === '1') return;
            img.dataset.posterFallbackApplied = '1';
            img.src = POSTER_FALLBACK;
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-primary font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              movie
            </span>
            Phim
          </span>
        </div>
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <button
            type="button"
            className="bg-white text-primary px-6 py-3 rounded-full font-headline font-bold shadow-xl pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform"
          >
            Đặt vé ngay
          </button>
        </div>
      </div>
      <div className="p-6">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((g) => (
              <span
                key={g.id}
                className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-xl font-bold font-headline mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex flex-wrap items-center text-on-surface-variant text-sm gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            {durationLabel}
          </span>
          <span className="flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">theaters</span>
            <span className="line-clamp-1">{genreLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function buildVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis');
    out.push(sorted[i]);
  }
  return out;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const visiblePages = useMemo(() => buildVisiblePages(page, totalPages), [page, totalPages]);

  return (
    <div className="mt-16 flex justify-center items-center gap-2 flex-wrap">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Trang trước"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {visiblePages.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-outline">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              page === item
                ? 'bg-primary text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-primary-container hover:text-primary'
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Trang sau"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
