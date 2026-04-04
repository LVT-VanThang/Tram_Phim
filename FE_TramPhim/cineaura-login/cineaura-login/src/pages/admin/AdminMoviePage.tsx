import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ==========================================
interface Genre {
  genre_id: number;
  genre_name: string;
}

interface Movie {
  movie_id?: number;
  title: string;
  description?: string;
  genres: Genre[];
  duration: number | string;
  release_date?: string;
  poster_url?: string;
  status?: string;
}

const API_URL = 'http://localhost:8080/api/admin/movies';

export function AdminMoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);

  // STATE TÌM KIẾM & LỌC
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 🌟 STATE CHO CUSTOM DROPDOWN (MỚI THÊM)
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // STATE PHÂN TRANG (PAGINATION)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [formData, setFormData] = useState({
    title: '', description: '', genreIds: '', duration: '', releaseDate: '', posterUrl: '', status: 'Đã phát hành'
  });

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setMovies(data || []);
    } catch (error) {
      showToast("Lỗi khi tải danh sách phim từ máy chủ!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedStatus]);

  const executeDelete = async () => {
    if (!movieToDelete) return;
    try {
      const res = await fetch(`${API_URL}/${movieToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Đã xóa phim thành công!", "success");
        setMovies(movies.filter(movie => movie.movie_id !== movieToDelete));
      } else {
        showToast("Xóa thất bại! Phim đang có dữ liệu liên kết.", "error");
      }
    } catch (error) { 
      showToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      setMovieToDelete(null); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title, description: formData.description, duration: parseInt(formData.duration as string) || 0,
      release_date: formData.releaseDate, poster_url: formData.posterUrl, status: formData.status, 
      genre_ids: formData.genreIds.split(',').map(id => parseInt(id.trim())).filter(n => !isNaN(n))
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setIsModalOpen(false); fetchMovies();
        showToast(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!", "success");
      } else showToast("Lưu thất bại! Kiểm tra lại.", "error");
    } catch (error) { showToast("Mất kết nối máy chủ!", "error"); }
  };

  const handleOpenModal = (movie: Movie | null = null) => {
    if (movie) {
      setFormData({
        title: movie.title, description: movie.description || '', genreIds: movie.genres?.map(g => g.genre_id).join(', ') || '',
        duration: String(movie.duration), releaseDate: movie.release_date || '', posterUrl: movie.poster_url || '', status: movie.status || 'Đã phát hành'
      });
      setEditingId(movie.movie_id || null);
    } else {
      setFormData({ title: '', description: '', genreIds: '', duration: '', releaseDate: '', posterUrl: '', status: 'Đã phát hành' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const allGenres = useMemo(() => {
    const genresSet = new Set<string>();
    movies.forEach(m => m.genres?.forEach(g => genresSet.add(g.genre_name)));
    return Array.from(genresSet);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || String(movie.movie_id).includes(searchTerm);
      const matchGenre = selectedGenre ? movie.genres?.some(g => g.genre_name === selectedGenre) : true;
      const matchStatus = selectedStatus ? (movie.status === selectedStatus) : true;
      return matchSearch && matchGenre && matchStatus;
    });
  }, [movies, searchTerm, selectedGenre, selectedStatus]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Đang cập nhật';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  };

  return (
    <section className="p-8 space-y-8 relative">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-white transition-all transform animate-bounce-short ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <span className="material-symbols-outlined text-2xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="tracking-wide">{toast.message}</span>
        </div>
      )}

      {movieToDelete !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMovieToDelete(null)}></div>
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all text-center animate-slide-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
               <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Xóa phim này?</h3>
            <p className="text-slate-500 text-sm mb-8">Dữ liệu bị xóa sẽ <span className="font-bold text-slate-700">không thể khôi phục</span>.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setMovieToDelete(null)} className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Hủy bỏ</button>
              <button onClick={executeDelete} className="flex-1 px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-slate-900">Thư viện Phim</h3>
          <p className="text-slate-500 mt-1">Quản lý và biên tập bộ sưu tập phim của rạp theo hệ thống.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-full font-bold shadow-md shadow-blue-500/30">
          <span className="material-symbols-outlined">add_circle</span>
          Thêm Phim mới
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-bold">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc ID phim..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="flex gap-4">
          
          {/* 🌟 CUSTOM DROPDOWN: LỌC THỂ LOẠI */}
          <div className="relative">
            <button 
              onClick={() => { setIsGenreOpen(!isGenreOpen); setIsStatusOpen(false); }}
              className="h-full flex items-center bg-white border border-slate-200 rounded-full shadow-sm px-5 py-2 hover:border-blue-300 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-slate-400 mr-2 text-[20px]">category</span>
              <div className="flex flex-col text-left mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Thể loại</span>
                <span className="text-sm font-bold text-slate-700 leading-none">
                  {selectedGenre || 'Tất cả thể loại'}
                </span>
              </div>
              <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform duration-200 ${isGenreOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Bảng xổ xuống được bo góc, có shadow */}
            {isGenreOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsGenreOpen(false)}></div>
                <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-30 py-2 overflow-hidden animate-slide-up">
                  <div 
                    onClick={() => { setSelectedGenre(''); setIsGenreOpen(false); }} 
                    className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedGenre === '' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                  >
                    Tất cả thể loại
                  </div>
                  {allGenres.map(genre => (
                    <div 
                      key={genre}
                      onClick={() => { setSelectedGenre(genre); setIsGenreOpen(false); }} 
                      className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedGenre === genre ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                    >
                      {genre}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 🌟 CUSTOM DROPDOWN: LỌC TRẠNG THÁI */}
          <div className="relative">
            <button 
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsGenreOpen(false); }}
              className="h-full flex items-center bg-white border border-slate-200 rounded-full shadow-sm px-5 py-2 hover:border-blue-300 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-slate-400 mr-2 text-[20px]">verified</span>
              <div className="flex flex-col text-left mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Trạng thái</span>
                <span className="text-sm font-bold text-blue-600 leading-none">
                  {selectedStatus || 'Tất cả trạng thái'}
                </span>
              </div>
              <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Bảng xổ xuống được bo góc, có shadow */}
            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsStatusOpen(false)}></div>
                <div className="absolute top-full mt-2 left-0 w-full min-w-[200px] bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-30 py-2 overflow-hidden animate-slide-up">
                  <div onClick={() => { setSelectedStatus(''); setIsStatusOpen(false); }} className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedStatus === '' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                    Tất cả trạng thái
                  </div>
                  <div onClick={() => { setSelectedStatus('Đã phát hành'); setIsStatusOpen(false); }} className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedStatus === 'Đã phát hành' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                    Đã phát hành
                  </div>
                  <div onClick={() => { setSelectedStatus('Sắp ra mắt'); setIsStatusOpen(false); }} className={`px-5 py-3 text-sm font-bold cursor-pointer transition-colors ${selectedStatus === 'Sắp ra mắt' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                    Sắp ra mắt
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative z-0">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-100">
            <tr>
              <th className="px-6 py-5">ID Phim</th>
              <th className="px-6 py-5">Tên phim</th>
              <th className="px-6 py-5">Thể loại</th>
              <th className="px-6 py-5">Thời lượng</th>
              <th className="px-6 py-5">Ngày phát hành</th>
              <th className="px-6 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {isLoading ? (
               <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Đang tải dữ liệu phim...</td></tr>
            ) : currentMovies.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Không tìm thấy kết quả nào phù hợp.</td></tr>
            ) : (
            currentMovies.map((movie) => (
              <tr key={movie.movie_id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">MV-{String(movie.movie_id).padStart(4, '0')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img className="w-10 h-14 rounded-lg object-cover shadow-sm border border-slate-100" src={movie.poster_url || "https://via.placeholder.com/40x56"} alt={movie.title} />
                    <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{movie.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 flex flex-wrap gap-1 mt-3">
                  {movie.genres && movie.genres.length > 0 ? movie.genres.map(g => (
                    <span key={g.genre_id} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wide">
                      {g.genre_name}
                    </span>
                  )) : <span className="text-xs text-slate-400 font-medium">Chưa có</span>}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{movie.duration} phút</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatDate(movie.release_date)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1 mt-2">
                  <button onClick={() => handleOpenModal(movie)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">edit_note</span></button>
                  <button onClick={() => setMovieToDelete(movie.movie_id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
        
        {!isLoading && (
           <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-white">
              <span className="text-sm font-medium text-slate-500">
                Đang hiển thị <span className="font-bold text-slate-700">{filteredMovies.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredMovies.length)}</span> trong số <span className="font-bold text-slate-700">{filteredMovies.length}</span> phim
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                            : 'text-slate-600 hover:bg-slate-100 bg-transparent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{editingId ? "Cập nhật Phim" : "Thêm Phim Mới"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"><span className="material-symbols-outlined text-lg">close</span></button>
            </div>
            <form id="movieForm" onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Tên phim</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" placeholder="Nhập tên phim..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Mô tả tóm tắt</label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Nội dung chính của phim..." />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">ID Thể loại (cách nhau dấu phẩy)</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.genreIds} onChange={e => setFormData({...formData, genreIds: e.target.value})} placeholder="VD: 1, 2" type="text" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Thời lượng (phút)</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} type="number" placeholder="VD: 120" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Ngày phát hành</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} type="date" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Trạng thái</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option value="Đã phát hành">Đã phát hành</option>
                     <option value="Sắp ra mắt">Sắp ra mắt</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">URL Poster</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} type="url" placeholder="https://..." />
              </div>
            </form>
            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-full transition-colors">Hủy bỏ</button>
              <button type="submit" form="movieForm" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md shadow-blue-500/30 transition-all active:scale-95">Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}