import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './login/LoginPage';
import { HomePage } from './pages/HomePage';
import { MovieListPage } from './pages/MovieListPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/phim" element={<MovieListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
