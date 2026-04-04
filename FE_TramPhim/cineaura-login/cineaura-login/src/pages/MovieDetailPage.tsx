import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { fetchMovieById, type Movie } from '../api/movies';
import {
  fetchShowtimesByMovieId,
  fetchShowtimesByMovieIdAndDate,
  type ShowtimeResponse,
} from '../api/showtimes';
import { clearSession, getStoredSession } from '../auth/session';

const POSTER_FALLBACK =
  'https://placehold.co/480x720/eef1f4/595c5e?text=CineAura&font=source-sans-pro';

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function nextWeekFrom(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams();
  const movieId = Number(movieIdParam);
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredSession());
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const dateOptions = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return nextWeekFrom(t);
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });
  const [loading, setLoading] = useState(true);
  const [stLoading, setStLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      setUser(getStoredSession());
    }
    window.addEventListener('storage', sync);
    window.addEventListener('cineaura-session', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cineaura-session', sync);
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(movieId) || movieId <= 0) {
      setError('Phim không hợp lệ');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await fetchMovieById(movieId);
        if (!cancelled) setMovie(m);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Không tải được phim';
          setError(msg === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : msg === 'NOT_FOUND' ? 'NOT_FOUND' : msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const loadShowtimes = useCallback(async () => {
    if (!Number.isFinite(movieId) || movieId <= 0) return;
    setStLoading(true);
    try {
      const iso = formatIsoDate(selectedDate);
      let list: ShowtimeResponse[] = [];
      try {
        list = await fetchShowtimesByMovieIdAndDate(movieId, iso);
      } catch {
        const all = await fetchShowtimesByMovieId(movieId);
        list = all.filter((s) => s.showDate === iso || s.showDate.startsWith(iso));
      }
      setShowtimes(list);
    } catch {
      setShowtimes([]);
    } finally {
      setStLoading(false);
    }
  }, [movieId, selectedDate]);

  useEffect(() => {
    void loadShowtimes();
  }, [loadShowtimes]);

  const groupedByCinema = useMemo(() => {
    const map = new Map<string, ShowtimeResponse[]>();
    for (const s of showtimes) {
      const k = s.cinemaName || 'Rạp';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return [...map.entries()];
  }, [showtimes]);

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    window.dispatchEvent(new Event('cineaura-session'));
  }, []);

  const displayName = user?.full_name?.trim() || user?.email || 'Thành viên';
  const poster =
    movie?.posterUrl?.trim() && /^https?:\/\//i.test(movie.posterUrl) ? movie.posterUrl : POSTER_FALLBACK;
  const genreLabel = movie?.genres?.length ? movie.genres.map((g) => g.name).join(', ') : '—';

  if (!Number.isFinite(movieId) || movieId <= 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <p className="text-on-surface-variant">Mã phim không hợp lệ.</p>
        <Link className="ml-4 text-primary font-bold" to="/phim">
          Về danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link className="text-2xl font-black text-blue-600 tracking-tighter font-headline" to="/">
              CineAura Bright
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link className="text-slate-600 font-medium font-headline hover:text-blue-500 transition-colors" to="/">
                Trang chủ
              </Link>
              <Link
                className="text-blue-600 font-bold border-b-2 border-blue-600 font-headline"
                to="/phim"
              >
                Phim
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end max-w-full">
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
                <Link to="/register" className="hidden sm:inline px-3 py-2 font-semibold text-slate-600 text-sm">
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold scale-95 active:scale-90 transition-transform"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {loading && (
          <div className="flex justify-center py-32 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_empty</span>
          </div>
        )}

        {!loading && error === 'UNAUTHORIZED' && (
          <div className="max-w-xl mx-auto px-8 py-16 text-center">
            <p className="text-on-surface-variant mb-4">Cần đăng nhập để xem chi tiết phim.</p>
            <Link className="text-primary font-bold underline" to="/login">
              Đăng nhập
            </Link>
          </div>
        )}

        {!loading && error && error !== 'UNAUTHORIZED' && (
          <div className="max-w-xl mx-auto px-8 py-16 text-center">
            <p className="text-error font-medium mb-4">
              {error === 'NOT_FOUND' ? 'Không tìm thấy phim.' : error}
            </p>
            <Link className="text-primary font-bold" to="/phim">
              Về danh sách phim
            </Link>
          </div>
        )}

        {!loading && !error && movie && (
          <>
            <section className="relative w-full min-h-[520px] md:h-[716px] overflow-hidden">
              <div className="absolute inset-0">
                <img alt="" className="w-full h-full object-cover" src={poster} />
                <div className="absolute inset-0 hero-movie-gradient" />
              </div>
              <div className="relative max-w-7xl mx-auto px-8 h-full min-h-[520px] md:min-h-[716px] flex flex-col justify-end pb-12">
                <div className="flex flex-col md:flex-row gap-8 items-end">
                  <div className="hidden md:block w-72 shrink-0 shadow-2xl rounded-xl overflow-hidden mb-[-40px] z-10 bg-surface-container-high">
                    <img alt={movie.title} className="w-full aspect-[2/3] object-cover" src={poster} />
                  </div>
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {movie.duration != null && (
                        <span className="bg-surface-container-high px-3 py-1 rounded-lg text-on-surface text-xs font-bold">
                          {movie.duration} phút
                        </span>
                      )}
                      <span className="text-secondary font-semibold font-label">{genreLabel}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black tracking-tighter text-on-background uppercase">
                      {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-medium text-sm md:text-base">
                      {movie.releaseDate && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary">calendar_today</span>
                          <span>{movie.releaseDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              <div className="lg:col-span-2 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-2xl font-headline font-bold text-on-background">Nội dung phim</h2>
                  <p className="text-on-surface-variant leading-relaxed text-lg">
                    {movie.description?.trim() || 'Nội dung đang được cập nhật.'}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-surface-container-high/30">
                  <h3 className="text-xl font-headline font-bold text-on-background mb-6">Thông tin</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-surface-container-high pb-3 gap-4">
                      <span className="text-on-surface-variant shrink-0">Thể loại</span>
                      <span className="font-semibold text-right">{genreLabel}</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-container-high pb-3 gap-4">
                      <span className="text-on-surface-variant shrink-0">Thời lượng</span>
                      <span className="font-semibold">{movie.duration != null ? `${movie.duration} phút` : '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-on-surface-variant shrink-0">Khởi chiếu</span>
                      <span className="font-semibold text-right">{movie.releaseDate ?? '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-tertiary-container rounded-xl shrink-0">
                    <span
                      className="material-symbols-outlined text-on-tertiary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      loyalty
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-on-tertiary-container">Ưu đãi thành viên</p>
                    <p className="text-sm text-tertiary mt-1">
                      Đăng nhập để tích điểm và nhận ưu đãi khi đặt vé qua CineAura Bright.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low py-16 px-8">
              <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-on-background">
                    Lịch chiếu &amp; suất
                  </h2>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                    {dateOptions.map((d) => {
                      const active = formatIsoDate(d) === formatIsoDate(selectedDate);
                      const wd = d.toLocaleDateString('vi-VN', { weekday: 'short' });
                      const day = d.getDate();
                      return (
                        <button
                          key={formatIsoDate(d)}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`flex flex-col items-center justify-center min-w-[76px] h-[4.5rem] rounded-2xl transition-all ${
                            active
                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/25'
                              : 'bg-surface-container-lowest text-on-background hover:bg-surface-container-high'
                          }`}
                        >
                          <span
                            className={`text-xs font-bold uppercase tracking-widest ${active ? 'opacity-90' : 'text-on-surface-variant'}`}
                          >
                            {wd}
                          </span>
                          <span className="text-2xl font-black">{day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {stLoading && (
                  <p className="text-on-surface-variant text-sm font-medium">Đang tải suất chiếu…</p>
                )}

                {!stLoading && groupedByCinema.length === 0 && (
                  <p className="text-on-surface-variant font-medium py-8">
                    Chưa có suất cho ngày đã chọn. Thử ngày khác.
                  </p>
                )}

                <div className="space-y-8">
                  {groupedByCinema.map(([cinema, slots]) => (
                    <div
                      key={cinema}
                      className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-primary">{cinema}</h3>
                        {slots[0]?.screenName && (
                          <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">meeting_room</span>
                            {slots[0].screenName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {slots
                          .slice()
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((st) => (
                            <Link
                              key={st.id}
                              to={`/dat-ve/${st.id}`}
                              className="px-6 py-3 bg-surface-container text-on-background rounded-xl font-bold text-base hover:bg-primary hover:text-on-primary transition-colors"
                            >
                              {st.startTime || '—'}
                              <span className="block text-[10px] font-semibold opacity-80 mt-0.5">
                                {st.formatLabel}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-slate-50 w-full pt-12 pb-8 border-t border-slate-200">
        <div className="px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-slate-500">
          <div>
            <Link className="text-lg font-bold text-blue-600 font-headline" to="/">
              CineAura Bright
            </Link>
            <p className="mt-2">© 2024 CineAura Bright. Đặt vé xem phim trực tuyến.</p>
          </div>
          <Link className="text-primary font-bold self-start" to="/phim">
            ← Danh sách phim
          </Link>
        </div>
      </footer>
    </div>
  );
}
