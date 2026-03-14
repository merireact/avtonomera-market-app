import { useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { useTelegram } from '../../context/TelegramContext';
import styles from './index.module.scss';

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 1000;
const MAX_NAME_LENGTH = 100;

function getDisplayName(user) {
  if (!user) return '';
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(' ') || 'Пользователь';
}

export function ReviewFormModal({ onSubmit, onCancel }) {
  const { user: telegramUser } = useTelegram();
  const telegramName = telegramUser ? getDisplayName(telegramUser).trim() : '';
  const nameFromTelegram = telegramName.length > 0 && telegramName.length <= MAX_NAME_LENGTH ? telegramName : null;

  const [manualName, setManualName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const displayRating = hoverRating || rating;

  const name = nameFromTelegram ?? manualName;

  const validate = () => {
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName) {
      setError('Укажите имя');
      return false;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Имя не более ${MAX_NAME_LENGTH} символов`);
      return false;
    }
    if (rating < 1 || rating > 5) {
      setError('Выберите оценку от 1 до 5');
      return false;
    }
    if (!trimmedText) {
      setError('Напишите текст отзыва');
      return false;
    }
    if (trimmedText.length < MIN_TEXT_LENGTH) {
      setError(`Текст отзыва не менее ${MIN_TEXT_LENGTH} символов`);
      return false;
    }
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      setError(`Текст не более ${MAX_TEXT_LENGTH} символов`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    const err = await onSubmit({
      name: name.trim(),
      rating,
      text: text.trim(),
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Не удалось отправить отзыв');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {nameFromTelegram ? (
        <div className={styles.label}>
          <span className={styles.labelText}>От имени</span>
          <p className={styles.telegramName}>{nameFromTelegram}</p>
        </div>
      ) : (
        <label className={styles.label}>
          Ваше имя
          <Input
            placeholder="Например: А. Петров"
            value={manualName}
            onChange={setManualName}
            className={styles.input}
          />
        </label>
      )}
      <label className={styles.label}>
        Оценка
        <div className={styles.starsRow} role="group" aria-label="Оценка от 1 до 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={styles.starBtn}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} из 5`}
              aria-pressed={rating === value}
            >
              <span className={value <= displayRating ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            </button>
          ))}
        </div>
      </label>
      <label className={styles.label}>
        Текст отзыва
        <textarea
          placeholder="Расскажите о вашем опыте..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textarea}
          rows={4}
          maxLength={MAX_TEXT_LENGTH}
        />
        <span className={styles.hint}>
          Не менее {MIN_TEXT_LENGTH} символов, не более {MAX_TEXT_LENGTH}. Сейчас: {text.length}
        </span>
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Отправка...' : 'Опубликовать'}
        </Button>
      </div>
    </form>
  );
}
