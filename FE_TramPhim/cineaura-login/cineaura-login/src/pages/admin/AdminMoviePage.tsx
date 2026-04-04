import { useState } from 'react';

// Dữ liệu giả (Mock Data) chờ API
const MOCK_MOVIES = [
  { id: 'MV-88291', title: 'Dune: Part Two', genres: 'Khoa học Viễn tưởng', duration: 166, releaseDate: '01/03/2024', status: 'Đã phát hành', posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeEhDUEIQoIGpQLyLjZsb57iM3F5xW9EocqGTG2m15HQK73TZOpGb3ZhgcoGfBbaa69SVp6WK67Uj5s_ipFFchgrIk__uBcy-mjsjuh1hFjOALb6NpQ037SgjREGNsmg0v_d7mj-2-ioQLInC-Scnpj3pexOz7zHk1aGm3Pl4xM5pSxkuSHiPNbrv1IKMG0JkqFv_gDxj-fh4tYQcsxgY2_esBTFQoAclv6G4HNjJ1bNcppEF2cQT-CvNLISyBjJMEYfF75mSiiA' },
  { id: 'MV-44102', title: 'Oppenheimer', genres: 'Chính kịch', duration: 180, releaseDate: '21/07/2023', status: 'Đã lưu trữ', posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4LhAzOabFXrV_F9Q7uFCFiqsEiYZ5e6obgqF2J-hBbvvIInF6DQvW2gmpIYReWSd2qlB2VUpvHyD8XRpHS91bC_s6qmIDroGA6JQ8ucMoGosVNI97NJmEPZzMeFtx5jNwuau-iS2XIiI4p2LNXH1PFLdiFNM5DJG19sqlyoXktv13fOSmXXnf2aypSzFqoSnZ6jTsaN3asaSI_gvuZZL7FYb7WNz2nZo_FXXDKw9EaFx4Opva3qSRMqcA4Wl4Ep52lYIQic1ww' },
];

export function AdminMoviePage() {
  // State để điều khiển việc đóng/mở Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="p-8 space-y-8 relative">
      {/* Header Action Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">Thư viện Phim</h3>
          <p className="text-slate-500 mt-1">Quản lý và biên tập bộ sưu tập phim của rạp.</p>
        </div>
        {/* Nút mở Modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Thêm Phim mới
        </button>
      </div>

      {/* Bảng dữ liệu phim */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-slate-500 text-xs uppercase tracking-widest font-bold">
              <th className="px-6 py-4">ID Phim</th>
              <th className="px-6 py-4">Tên phim</th>
              <th className="px-6 py-4">Thể loại</th>
              <th className="px-6 py-4">Thời lượng</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Render danh sách từ mảng MOCK_MOVIES */}
            {MOCK_MOVIES.map((movie) => (
              <tr key={movie.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{movie.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img alt={movie.title} className="w-10 h-14 rounded object-cover shadow-sm" src={movie.posterUrl} />
                    <div className="font-bold text-slate-900 group-hover:text-primary">{movie.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">{movie.genres}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{movie.duration} phút</td>
                <td className="px-6 py-4 text-sm text-slate-500">{movie.status}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setIsModalOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM/SỬA PHIM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 font-headline">Chi tiết Phim</h3>
              {/* Nút đóng Modal */}
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               <form className="space-y-6">
                 {/* ... (Bạn paste các thẻ input từ file HTML cũ vào đây, nhớ đổi class thành className và đóng thẻ <input /> nhé) ... */}
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phim</label>
                    <input className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Nhập tên phim..." type="text" />
                 </div>
               </form>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-xl">Hủy bỏ</button>
              <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-md">Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}