import { Outlet, NavLink } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex font-body">
      
      {/* Sidebar */}
      <aside className="flex flex-col h-screen sticky top-0 w-64 border-r border-slate-200 bg-slate-50 font-headline tracking-tight">
        <div className="p-6">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                movie
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">CineAura Bright</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Cổng Quản trị
              </p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">

            {/* Dashboard */}
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${
                  isActive
                    ? "text-blue-700 font-semibold border-r-4 border-blue-600 bg-blue-50/50"
                    : "text-slate-500 hover:text-blue-500 hover:bg-blue-50/50"
                }`
              }
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium">Tổng quan</span>
            </NavLink>

            {/* Movies CRUD */}
            <NavLink
              to="/admin/movies"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${
                  isActive
                    ? "text-blue-700 font-semibold border-r-4 border-blue-600 bg-blue-50/50"
                    : "text-slate-500 hover:text-blue-500 hover:bg-blue-50/50"
                }`
              }
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                movie
              </span>
              <span className="font-medium">Quản lý Phim</span>
            </NavLink>

          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex justify-between items-center px-8 h-16 w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm shadow-blue-900/5">
          <h2 className="text-lg font-black text-slate-900 font-headline">
            Quản trị Hệ thống
          </h2>

          <div className="flex items-center gap-4">

            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <img
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv5Nv4MDDNKkG4hzWBizeE5sL3NcEAhs82Ap8DD5-5MmukBfk--EjqRR8i4XwXWQQplWj1typ6WgKZrx014d_zq_UhAc7Ic6LqVWZgXRz-b9nHtCeJIxUGHkEhUSRu9gjZ_oou4obAXoO5hah-wqvRlKkoVtxgFP_t3SKt86CwNSCXhsrCLCgftSMgaJR2koivou4Ft_Y7ux25aCFPX3N9eiwbynlx_Nkco6G37rH895Sb3rR-guX1JVYJwgnZNPjm4ydtCvQI8w"
            />
          </div>
        </header>

        {/* Page Content (CRUD pages) */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>

      </main>
    </div>
  );
}