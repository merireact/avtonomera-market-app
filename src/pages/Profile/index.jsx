import { Link } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './index.module.scss';

const SUPPORT_TELEGRAM = 'nomeramarket_direct';
const SUPPORT_URL = `https://t.me/${SUPPORT_TELEGRAM}`;

const ADMIN_TELEGRAM_USERNAMES = ['ironchik15', 'merireact'];
function isAdminUser(user) {
  if (!user?.username) return false;
  return ADMIN_TELEGRAM_USERNAMES.includes(user.username.toLowerCase());
}

function getDisplayName(user) {
  if (!user) return '';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(' ') || 'Пользователь';
}

function getInitials(user) {
  if (!user) return '?';
  const first = user.first_name?.trim().charAt(0)?.toUpperCase() || '';
  const last = user.last_name?.trim().charAt(0)?.toUpperCase() || '';
  return (first + last).slice(0, 2) || '?';
}

export function Profile() {
  const { user, isFromTelegram } = useTelegram();
  const { favorites } = useFavorites();
  const favoritesCount = favorites.size;
  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Профиль</h1>
      </header>

      <section className={styles.card}>
        {isFromTelegram && user ? (
          <>
            <div className={styles.avatarWrap}>
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt=""
                  className={styles.avatar}
                  width={72}
                  height={72}
                />
              ) : (
                <span className={styles.avatarPlaceholder} aria-hidden>
                  {initials}
                </span>
              )}
            </div>
            <p className={styles.userName}>{displayName}</p>
            {user.username && (
              <p className={styles.userUsername}>@{user.username}</p>
            )}
          </>
        ) : (
          <p className={styles.fallback}>
            Откройте приложение из Telegram, чтобы подтянуть профиль (имя и
            аватарку).
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Аккаунт</h2>
        <Link to="/favorites" className={styles.link}>
          <span className={styles.linkLabel}>Мои избранные номера</span>
          <span className={styles.linkMeta}>
            {favoritesCount > 0 ? favoritesCount : 'Пусто'}
          </span>
          <span className={styles.linkArrow} aria-hidden>
            →
          </span>
        </Link>
      </section>

      {isFromTelegram && user && isAdminUser(user) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Админ</h2>
          <Link to="/admin" className={styles.link}>
            <span className={styles.linkLabel}>Вход для админа</span>
            <span className={styles.linkArrow} aria-hidden>
              →
            </span>
          </Link>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Поддержка</h2>
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <span className={styles.linkLabel}>Написать в Telegram</span>
          <span className={styles.linkMeta}>@{SUPPORT_TELEGRAM}</span>
          <span className={styles.linkArrow} aria-hidden>
            →
          </span>
        </a>
      </section>
    </div>
  );
}
