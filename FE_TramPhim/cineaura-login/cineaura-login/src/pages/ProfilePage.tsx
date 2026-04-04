import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { LoginResponse } from '../api/auth';
import { getStoredSession } from '../auth/session';

export function ProfilePage() {
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

  if (!user) {
    return <Navigate to="/login" replace state={{ fromProfile: true }} />;
  }

  const name = user.full_name?.trim() || '—';
  const email = user.email?.trim() || '—';
  const phone = user.phone?.trim() || '—';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <header className="border-b border-surface-container-high bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-blue-600 font-headline font-bold text-lg hover:opacity-90">
            ← Trang chủ
          </Link>
          <h1 className="font-headline font-bold text-on-background text-lg">Thông tin cá nhân</h1>
          <span className="w-20" aria-hidden />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/50 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/90 to-primary-container/90 px-6 py-8 text-on-primary">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm opacity-90">Xin chào</p>
                <p className="text-xl font-headline font-bold truncate">{name}</p>
              </div>
            </div>
          </div>
          <dl className="divide-y divide-surface-container-high">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Họ và tên</dt>
              <dd className="text-on-background font-medium break-words">{name}</dd>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Email</dt>
              <dd className="text-on-background font-medium break-all">{email}</dd>
            </div>
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold text-on-surface-variant shrink-0 sm:w-40">Số điện thoại</dt>
              <dd className="text-on-background font-medium">{phone}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Thông tin lấy từ phiên đăng nhập. Đổi mật khẩu hoặc cập nhật hồ sơ khi backend hỗ trợ.
        </p>
      </main>
    </div>
  );
}
