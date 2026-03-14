import { BrowserRouter } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { TelegramProvider } from './context/TelegramContext';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
      <TelegramProvider>
        <FavoritesProvider>
          <AppRouter />
          <BottomTabBar />
        </FavoritesProvider>
      </TelegramProvider>
    </BrowserRouter>
  );
}

export default App;
