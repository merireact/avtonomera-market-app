import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * При переключении между страницами (вкладками) сбрасывает позицию скролла в начало.
 * Контейнер прокрутки — document (window).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
