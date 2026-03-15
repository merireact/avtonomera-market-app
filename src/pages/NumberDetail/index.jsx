import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useNumbers } from '../../hooks/useNumbers';
import { updateNumber, deleteNumber } from '../../api/numbers';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { hasSameMiddleDigits, hasSameLetters } from '../../utils/numberUtils';
import styles from './index.module.scss';

function formatPrice(item) {
  return typeof item.price === 'string'
    ? item.price
    : new Intl.NumberFormat('ru-RU').format(item.price) + ' ₽';
}

export function NumberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAdmin } = useAuth();
  const { numbers: numbersData, loading, refetch: refetchNumbers } = useNumbers();
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('Свободен');
  const [editPrice, setEditPrice] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editDeleting, setEditDeleting] = useState(false);
  const [editError, setEditError] = useState(null);

  const item = numbersData.find((n) => String(n.id) === id);

  const openEdit = useCallback(() => {
    if (!item) return;
    setEditStatus(item.status || 'Свободен');
    setEditPrice(typeof item.price === 'string' ? item.price : (item.price != null ? String(item.price) : ''));
    setEditError(null);
    setEditOpen(true);
  }, [item]);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditError(null);
  }, []);

  const handleEditSave = useCallback(async (e) => {
    e.preventDefault();
    if (!item) return;
    setEditError(null);
    setEditSaving(true);
    const priceVal = editPrice.trim() === '' || editPrice.trim().toLowerCase() === 'договорная' ? 'договорная' : editPrice.trim();
    const { error } = await updateNumber(item.id, { status: editStatus.trim(), price: priceVal });
    setEditSaving(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    await refetchNumbers();
    closeEdit();
  }, [item, editStatus, editPrice, refetchNumbers, closeEdit]);

  const handleEditDelete = useCallback(async () => {
    if (!item) return;
    const numStr = item.number.replace(/\s/g, '');
    if (!window.confirm(`Удалить номер ${numStr}?`)) return;
    setEditError(null);
    setEditDeleting(true);
    const { error } = await deleteNumber(item.id);
    setEditDeleting(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    await refetchNumbers();
    closeEdit();
    navigate('/numbers');
  }, [item, refetchNumbers, closeEdit, navigate]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <p>Номер не найден</p>
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(item.id);
  const numberSlitno = item.number.replace(/\s/g, '');
  const telegramMessage = `Здравствуйте, интересует этот номер: ${numberSlitno}`;
  const telegramUrl = `https://t.me/nomeramarket_direct?text=${encodeURIComponent(telegramMessage)}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Карточка номера</h1>
      </header>

      <main className={styles.main}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.number}>{numberSlitno}</div>
            <button
              type="button"
              className={styles.favorite}
              onClick={() => toggleFavorite(item.id)}
              aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={favorite ? '#10331d' : 'none'} stroke="#10331d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <dl className={styles.details}>
            <div className={styles.row}>
              <dt>Город</dt>
              <dd>{item.city}</dd>
            </div>
            <div className={styles.row}>
              <dt>Статус</dt>
              <dd>{item.status}</dd>
            </div>
            <div className={styles.row}>
              <dt>Цена</dt>
              <dd className={styles.price}>{formatPrice(item)}</dd>
            </div>
          </dl>

          {(item.vip || hasSameMiddleDigits(item.number) || hasSameLetters(item.number)) && (
            <div className={styles.tags}>
              {item.vip && <span className={styles.tag}>Эксклюзивный</span>}
              {hasSameMiddleDigits(item.number) && <span className={styles.tag}>Одинаковые цифры</span>}
              {hasSameLetters(item.number) && <span className={styles.tag}>Одинаковые буквы</span>}
            </div>
          )}

          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>Связаться</h3>
            <div className={styles.actions}>
              <a href="tel:+79995999177" className={styles.contactBtn} rel="noopener noreferrer">
                <span className={styles.contactIcon} aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>+7 999 599-91-77</span>
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactBtn}
              >
                <span className={styles.contactIcon} aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </span>
                <span>@nomeramarket_direct</span>
              </a>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.adminSection}>
              <button
                type="button"
                className={styles.editBtnLarge}
                onClick={openEdit}
              >
                Изменить
              </button>
            </div>
          )}
        </article>
      </main>

      <Modal open={editOpen} onClose={closeEdit} title="Изменить номер">
        <form className={styles.editForm} onSubmit={handleEditSave}>
          <p className={styles.editNumber}>{numberSlitno}</p>
          {editError && <p className={styles.editError}>{editError}</p>}
          <label className={styles.editLabel}>
            Статус
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={styles.editSelect}>
              <option value="Свободен">Свободен</option>
              <option value="Забронирован">Забронирован</option>
            </select>
          </label>
          <label className={styles.editLabel}>
            Цена (число или «договорная»)
            <Input value={editPrice} onChange={setEditPrice} placeholder="400000 или договорная" />
          </label>
          <div className={styles.editActions}>
            <Button type="button" variant="secondary" onClick={closeEdit} disabled={editSaving || editDeleting}>Отмена</Button>
            <Button type="submit" disabled={editSaving || editDeleting}>{editSaving ? 'Сохранение...' : 'Сохранить'}</Button>
          </div>
          <div className={styles.editDeleteWrap}>
            <button
              type="button"
              className={styles.editDeleteBtn}
              onClick={handleEditDelete}
              disabled={editSaving || editDeleting}
            >
              {editDeleting ? 'Удаление...' : 'Удалить номер'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
