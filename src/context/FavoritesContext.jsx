import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTelegram } from './TelegramContext';
import { fetchFavoriteIds, syncFavorite } from '../api/favorites';

const STORAGE_KEY = 'avtonomera-favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(Number).filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch (_) {}
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useTelegram();
  const telegramUserId = user?.id ?? null;
  const [favorites, setFavoritesState] = useState(loadFavorites);
  const favoritesRef = useRef(favorites);
  const removedRef = useRef(new Set());

  useEffect(() => {
    favoritesRef.current = favorites;
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (telegramUserId == null) return undefined;
    let cancelled = false;

    (async () => {
      const remoteIds = await fetchFavoriteIds(telegramUserId);
      if (cancelled || !remoteIds) return;

      const localIds = [...favoritesRef.current];
      setFavoritesState((prev) => {
        const next = new Set(prev);
        remoteIds.forEach((id) => {
          if (!removedRef.current.has(id)) next.add(id);
        });
        return next;
      });

      const remoteSet = new Set(remoteIds);
      await Promise.all(
        localIds
          .filter((id) => !remoteSet.has(id) && !removedRef.current.has(id))
          .map((id) => syncFavorite({ telegramUserId, numberId: id, active: true })),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [telegramUserId]);

  const toggleFavorite = useCallback((id, price) => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    const active = !favoritesRef.current.has(numericId);
    const next = new Set(favoritesRef.current);
    if (active) {
      next.add(numericId);
      removedRef.current.delete(numericId);
    } else {
      next.delete(numericId);
      removedRef.current.add(numericId);
    }
    favoritesRef.current = next;
    setFavoritesState(next);

    if (telegramUserId != null) {
      syncFavorite({ telegramUserId, numberId: numericId, price, active });
    }
  }, [telegramUserId]);

  const isFavorite = useCallback(
    (id) => favorites.has(id),
    [favorites]
  );

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
