import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import NewsPage from './pages/NewsPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const location = useLocation();
  const initTheme = useAppStore((s) => s.initTheme);
  const restore = useAuthStore((s) => s.restore);

  // 初始化主题（dark/light/system）和恢复登录态
  useEffect(() => {
    initTheme();
    restore();
  }, [initTheme, restore]);

  // 标题
  useEffect(() => {
    const map: Record<string, string> = {
      '/': 'AI 资讯日报 · AI News',
      '/favorites': '我的收藏 · AI News',
      '/settings': '设置 · AI News',
      '/login': '登录 · AI News',
      '/register': '注册 · AI News',
    };
    document.title = map[location.pathname] ?? 'AI News';
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<NewsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
