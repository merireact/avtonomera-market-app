import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Parses Telegram Web App initData and returns the user object if present.
 * initData is a query string with keys: user (JSON), auth_date, hash, etc.
 * @returns {{ id: number, first_name: string, last_name?: string, username?: string, language_code?: string, photo_url?: string } | null}
 */
function parseTelegramUser() {
  if (typeof window === 'undefined') return null;
  const twa = window.Telegram?.WebApp;
  const initData = twa?.initData;
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user && typeof user.id === 'number' ? user : null;
  } catch {
    return null;
  }
}

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [state, setState] = useState(() => ({
    user: null,
    webApp: null,
  }));

  useEffect(() => {
    const user = parseTelegramUser();
    setState({
      user,
      webApp: window.Telegram?.WebApp ?? null,
    });
  }, []);

  const value = {
    user: state.user,
    isFromTelegram: Boolean(state.user),
    webApp: state.webApp,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error('useTelegram must be used within TelegramProvider');
  return ctx;
}
