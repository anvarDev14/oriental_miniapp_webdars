// Telegram WebApp utilities
export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp;
};

export const useTelegramWebApp = () => {
  return getTelegramWebApp();
};

export const initApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
};

export const getInitData = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initData || '';
};

export const getUserData = () => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};
