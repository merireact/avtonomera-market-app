import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './navigation/AppRouter';
import { BottomTabBar } from './components/BottomTabBar';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <BottomTabBar />
    </BrowserRouter>
  );
}

export default App;
