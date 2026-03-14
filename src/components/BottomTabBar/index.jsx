import { useNavigate, useLocation } from 'react-router-dom';
import styles from './index.module.scss';

const TABS = [
  { path: '/', label: 'Номера', icon: 'numbers' },
  { path: '/favorites', label: 'Избранное', icon: 'heart' },
  { path: '/reviews', label: 'Отзывы', icon: 'reviews' },
  { path: '/profile', label: 'Профиль', icon: 'profile' },
];

function Icon({ name, active }) {
  const color = active ? '#10331d' : 'rgba(16, 51, 29, 0.45)';
  if (name === 'numbers') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </svg>
    );
  }
  if (name === 'heart') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (name === 'reviews') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (name === 'profile') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    );
  }
  return null;
}

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className={styles.bar} role="navigation" aria-label="Основное меню">
      {TABS.map(({ path, label, icon }) => {
        const active = path === '/' ? (pathname === '/' || pathname.startsWith('/numbers')) : pathname === path;
        return (
          <button
            key={path}
            type="button"
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={icon} active={active} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
