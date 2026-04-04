import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './login/LoginPage';
import { HomePage } from './pages/HomePage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { MovieListPage } from './pages/MovieListPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';



import { AdminLayout } from './layouts/AdminLayout';
import { AdminMoviePage } from './pages/admin/AdminMoviePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/phim" element={<MovieListPage />} />
        <Route path="/phim/:movieId" element={<MovieDetailPage />} />
        <Route path="/dat-ve/:showtimeId" element={<SeatSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ho-so" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />



        {/* ROUTES CHO ADMIN (Được bọc trong AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Khi vào /admin/movies, nó sẽ render AdminMoviePage lọt vào vị trí <Outlet /> của Layout */}
          <Route path="movies" element={<AdminMoviePage />} />
        </Route>


      </Routes>
    </BrowserRouter>
  );
}
