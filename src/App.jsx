import { BrowserRouter, useLocation } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { TelegramProvider } from './context/TelegramContext';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';
import { ScrollToTop } from './components/ScrollToTop';

function AppContent() {
  const location = useLocation();
  const hideTabs = location.pathname === '/admin';

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
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </TelegramProvider>
    </BrowserRouter>
  );
}

export default App;
