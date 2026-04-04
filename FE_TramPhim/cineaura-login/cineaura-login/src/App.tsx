import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./login/LoginPage";
import { HomePage } from "./pages/HomePage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { MovieListPage } from "./pages/MovieListPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SeatSelectionPage } from "./pages/SeatSelectionPage";

import { AdminLayout } from "./layouts/AdminLayout";
import { AdminMoviePage } from "./pages/admin/AdminMoviePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/phim" element={<MovieListPage />} />
        <Route path="/phim/:movieId" element={<MovieDetailPage />} />
        <Route path="/dat-ve/:showtimeId" element={<SeatSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ho-so" element={<ProfilePage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>

         {/* 🌟 2. SỬA Ở ĐÂY: Thay AdminMoviePage thành AdminDashboardPage */}
          <Route index element={<AdminDashboardPage />} />

          {/* Vẫn giữ path "movies" để lỡ trên menu bạn gắn link to="/admin/movies" thì nó vẫn chạy đúng */}
          <Route path="movies" element={<AdminMoviePage />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}