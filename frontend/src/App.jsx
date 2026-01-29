import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegramWebApp } from './utils/telegram';
import { useStore } from './store/store';

// Pages
import HomePage from './pages/HomePage';
import DirectionsPage from './pages/DirectionsPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MaterialPage from './pages/MaterialPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';

// Components
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const webApp = useTelegramWebApp();
  const { user, loading, fetchUser } = useStore();

  useEffect(() => {
    if (webApp) {
      // Initialize Telegram Web App
      webApp.ready();
      webApp.expand();
      
      // Set theme
      webApp.setHeaderColor('#2AABEE');
      webApp.setBackgroundColor('#FFFFFF');
      
      // Fetch user data
      fetchUser(webApp.initData);
    }
  }, [webApp, fetchUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/directions" element={<DirectionsPage />} />
          <Route path="/courses/:directionId" element={<CoursesPage />} />
          <Route path="/course/:courseId" element={<CourseDetailPage />} />
          <Route path="/material/:materialId" element={<MaterialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
