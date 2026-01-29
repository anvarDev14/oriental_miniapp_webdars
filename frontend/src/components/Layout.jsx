import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTelegramWebApp } from '../utils/telegram';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const webApp = useTelegramWebApp();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Asosiy' },
    { path: '/directions', icon: '📚', label: 'Kurslar' },
    { path: '/favorites', icon: '⭐', label: 'Saralangan' },
    { path: '/profile', icon: '👤', label: 'Profil' },
  ];

  // Show back button for nested pages
  const showBackButton = !['/'].includes(location.pathname) &&
    !menuItems.some(item => item.path === location.pathname);

  React.useEffect(() => {
    if (webApp && showBackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate(-1));
    } else if (webApp) {
      webApp.BackButton.hide();
    }

    return () => {
      if (webApp) {
        webApp.BackButton.offClick();
      }
    };
  }, [location.pathname, webApp, navigate, showBackButton]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 pb-20 animate-fade-in">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 px-4 py-2 safe-bottom z-50">
        <div className="flex justify-around items-center max-w-screen-lg mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ripple ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${
                isActive(item.path) ? 'scale-110' : ''
              }`}>
                {item.icon}
              </span>
              <span className={`text-xs mt-1 font-medium ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
