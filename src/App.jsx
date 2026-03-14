import { BrowserRouter } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ''}>
      <FavoritesProvider>
        <AppRouter />
        <BottomTabBar />
      </FavoritesProvider>
    </BrowserRouter>
  );
}

export default App;
