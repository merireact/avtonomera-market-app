import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { TelegramProvider } from './context/TelegramContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';
import { ScrollToTop } from './components/ScrollToTop';
import { trackAppVisit } from './api/analytics';
import { requestCatalogSync } from './api/syncAutonomera';
import { useTelegram } from './context/TelegramContext';

function AppContent() {
  const location = useLocation();
  const { user: telegramUser } = useTelegram();
  const hideTabs = location.pathname === '/admin';

  useEffect(() => {
    if (location.pathname !== '/admin') trackAppVisit(telegramUser ?? null);
  }, [telegramUser, location.pathname]);

  useEffect(() => {
    let cancelled = false;
    requestCatalogSync().then(({ data }) => {
      if (cancelled || !data?.ran) return;
      if ((data.added || 0) + (data.updated || 0) + (data.removed || 0) > 0) {
        window.dispatchEvent(new Event('catalog-synced'));
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <AppRouter />
      {!hideTabs && <BottomTabBar />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
      <TelegramProvider>
        <AuthProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  );
}

export default App;
