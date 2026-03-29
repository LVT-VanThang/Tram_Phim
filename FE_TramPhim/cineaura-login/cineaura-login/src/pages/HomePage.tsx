import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { clearSession, getStoredSession } from '../auth/session';

export function HomePage() {
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredSession());

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
              <a
                className="text-slate-600 font-medium font-headline tracking-tight hover:text-blue-500 transition-colors duration-200"
                href="#"
              >
                Rạp chiếu
              </a>
              <a
                className="text-slate-600 font-medium font-headline tracking-tight hover:text-blue-500 transition-colors duration-200"
                href="#"
              >
                Ưu đãi
              </a>
             
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
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <span className="hidden sm:inline text-sm font-medium text-slate-600 max-w-[140px] truncate" title={displayName}>
                    Xin chào, {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm sm:text-base"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Đăng xuất
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
        <section className="relative px-8 py-12 max-w-7xl mx-auto">
          <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden group">
            <img
              className="w-full h-full object-cover"
              alt="Dune Part Two hero"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxKFq38gUdGpKjQZCHH32QBiGNphIipFsi9B03YRqfuwO4YRsdD_s3-kjp5g-yoTDJOP2RghFJkNtTdXqkBpEAdi8B8jiJQPvQmNJGDDkCO7d8lbRMC9zPOf8UYql-RVdoS4svtP8X02bNHgFdihvlwhrgQ55_zrdrIRcEVUmnQlnzLtRNjszh8RTclebAbXaoElAAckWJIkyeNn6iKPaVpwbwH2jOTey2KPKOMGiZi2t72sou4tJVo-10gFkzrvWWd-3xviWxpfrq"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-bold tracking-widest uppercase">
                    Phim tiêu điểm
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-bold tracking-widest uppercase">
                    IMAX
                  </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white font-headline tracking-tighter leading-none">
                  Dune: Part Two
                </h1>
                <p className="text-lg text-white/80 max-w-lg font-medium leading-relaxed">
                  Hành trình tiếp theo của Paul Atreides khi anh hợp lực với Chani và người Fremen để trả thù những kẻ đã hủy diệt gia đình mình.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      confirmation_number
                    </span>
                    Đặt Vé Ngay
                  </button>
                  <button
                    type="button"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">play_circle</span>
                    Xem Trailer
                  </button>
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
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 min-h-[320px]"
                alt="Godzilla x Kong"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIcOeIH_fr6NC98OoFwCBMUkoMER3KAX04oO_BHzjHtmrgtdMgxGuhQygUgUV8uKvuvpWDqzakYavgkmXjeLo0cmnKOnLCKxRc7n9N_HkjJqFQ7DK_Bf0YCidCh5aWjVHmgiicM3hQksa_ZWRzEfQJi1atybLWIqO7wMWgyt6mRHXiq8_HT2skfPuhB_9FYTwSFK5Nb94ow29WCpzj1xA426HMXfuZ_khf2Px2Opof3kA8fV53rVOKfwf-qRSUr0EKOH4II2xkgPp5"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="text-white">
                  <h3 className="text-3xl font-bold font-headline mb-2">Godzilla x Kong: Đế Chế Mới</h3>
                  <div className="flex items-center gap-4 text-sm font-medium mb-6">
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-yellow-400 text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>{' '}
                      8.8
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> 115 Phút
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold"
                  >
                    Đặt Vé
                  </button>
                </div>
              </div>
            </div>

            <MovieCard
              title="Kung Fu Panda 4"
              meta="Hoạt hình • 94 Phút"
              rating="8.5"
              poster="https://lh3.googleusercontent.com/aida-public/AB6AXuDmPyHOgFehwvcgJsfg-FAOL9ixS8E3cWXGeocumE3y7XPW9xZ0Kee6niqPHWwm8XOY_5BS7NM-fLHSQF0zhMdgll8YjR_CsGIWYUbGBPbO4pYsIFkMWCSfPmJ0Q9KjIh-H_T22FRjTS5jxFuGvZSS42L604fqyQ4IuVOKAs5hmKYQJpEq6pCY_i5Oxe2IjUrWJFaW-ymwwowwmgPHJEMtUrWvBZXXdWY4Rs3TBWj0PXxkwFvl-6ruBRXSy6R7IblJPgJ7RRa9S3vWX"
            />
            <MovieCard
              title="Ngày Tận Thế"
              meta="Hành động • 109 Phút"
              rating="7.9"
              poster="https://lh3.googleusercontent.com/aida-public/AB6AXuBEH78rl9Mxm8lB3s-yp0TE1TVDe0_Jbox3rgOp4MKUTEwuVHEcwj5ivK_sw3myk0CIylVDoiMSaP-maPWGoquYn0smJnknzCHVLY1SxCeXrWbdnqBHkWAACmPZaUwYMu7m-tVENHmddexXoCUeR4umPlOJ9RKR8wqPfX45CQyrIWQUS6ORBBBaJq-ZfEWBHW08FrdOrkuL_S4zOWkJrmyOmzzatH5l6XTCIm56osXZEBbm9JL7KYUCrF9T9yjHslss_SwkSUJ7dRgp"
            />
            <MovieCard
              title="Inside Out 2"
              meta="Hoạt hình • 100 Phút"
              rating="9.2"
              poster="https://lh3.googleusercontent.com/aida-public/AB6AXuChHZQiLF82uBhFjI3p3vFgk44JbEBIOogJ2ZR13yrIZqF7erpUEq3MyWQFKMLcuDlfXwCWdIt3VOgpPlggM_UrEW3L1QqPsFgm7BHvEMKLKVJ-2fABl9fKC_bqrTzdfHyxhQpf5pJvlJcQoIKMEQgmBFJF5jeIeOEt5DqQIV-P6bZekwb1IslaK6qXoB9_tSk_gkqIKbtwOxAYa3wO5KSdm7JazrdE6BN98NSO8-_dEvW7crgFs3k_zWgnRe3gQP51OJ-YlU2hhAyF"
            />
            <MovieCard
              title="Furiosa: Mad Max"
              meta="Hành động • 148 Phút"
              rating="8.4"
              poster="https://lh3.googleusercontent.com/aida-public/AB6AXuBLZ1z5f3ZQCkZuqsMiX62mSGNJgKv3iIlMNQDJqrfp_fA8D_xw1a2FqW9JN0CULDRHEhCmeVzbv6MGGZ86RqhW_VS_IZdVIIrWqYjrVnAEQQdqrJjs1OFgrg_fyvVFptceFPcpeQSQOOkoFBINsF0QsTwLxhvqw88EYsm4wm0nApTdTNWXq5xGWYC1vs93K27ytUc77_cUJm5lKNCpbp8GM6vzybFvnU41XKHuZ06hOWjpCqK75KfF93Avcu6f2hOglLS0p7uZXbFa"
            />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
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
          <div>
            <h4 className="font-bold font-headline text-lg mb-6">Tải ứng dụng</h4>
            <p className="text-slate-500 font-medium mb-6">Tải ứng dụng CineAura để đặt vé nhanh hơn.</p>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full bg-black text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">ios</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none opacity-60">Download on the</p>
                  <p className="text-lg font-bold leading-none">App Store</p>
                </div>
              </button>
              <button
                type="button"
                className="w-full bg-black text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">shop</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none opacity-60">Get it on</p>
                  <p className="text-lg font-bold leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-sm">© 2024 CineAura. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

function MovieCard({
  title,
  meta,
  rating,
  poster,
}: {
  title: string;
  meta: string;
  rating: string;
  poster: string;
}) {
  return (
    <div className="group bg-surface-container-lowest rounded-[2rem] overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2">
      <div className="aspect-[2/3] overflow-hidden relative">
        <img className="w-full h-full object-cover" alt={title} src={poster} />
        <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1 text-xs font-bold text-on-surface">
          <span
            className="material-symbols-outlined text-yellow-500 text-xs"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>{' '}
          {rating}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold font-headline text-on-surface line-clamp-1 mb-1">{title}</h3>
        <p className="text-slate-500 text-sm font-medium mb-4">{meta}</p>
        <button
          type="button"
          className="w-full py-3 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all"
        >
          Đặt Vé
        </button>
      </div>
    </div>
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
