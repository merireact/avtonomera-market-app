import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { TelegramProvider } from './context/TelegramContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';
import { ScrollToTop } from './components/ScrollToTop';
import { trackAppVisit } from './api/analytics';
import { useTelegram } from './context/TelegramContext';

function AppContent() {
  const location = useLocation();
  const { user: telegramUser } = useTelegram();
  const hideTabs = location.pathname === '/admin';

  useEffect(() => {
    if (location.pathname !== '/admin') trackAppVisit(telegramUser ?? null);
  }, [telegramUser, location.pathname]);

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
