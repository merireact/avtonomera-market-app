import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Numbers } from '../pages/Numbers';
import { NumberDetail } from '../pages/NumberDetail';
import { Favorites } from '../pages/Favorites';
import { Reviews } from '../pages/Reviews';
import { Profile } from '../pages/Profile';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/numbers" element={<Numbers />} />
      <Route path="/numbers/:id" element={<NumberDetail />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
