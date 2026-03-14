import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ReviewCard } from '../../components/ReviewCard';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { useReviews } from '../../hooks/useReviews';
import { ReviewFormModal } from '../../components/ReviewFormModal';
import styles from './index.module.scss';

export function Reviews() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reviews, loading, error, addReview } = useReviews();
  const [formOpen, setFormOpen] = useState(Boolean(location.state?.openReview));

  useEffect(() => {
    if (location.state?.openReview) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.openReview, navigate]);

  const handleSubmit = async (payload) => {
    const { error: submitError } = await addReview(payload);
    if (submitError) return submitError;
    setFormOpen(false);
    return null;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Отзывы</h1>
        <Button
          variant="secondary"
          className={styles.leaveReviewBtn}
          onClick={() => setFormOpen(true)}
        >
          <span className={styles.btnIcon} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          Оставить отзыв
        </Button>
      </header>
      <main className={styles.main}>
        {error && (
          <p className={styles.error}>
            Не удалось загрузить отзывы. Показаны сохранённые данные.
          </p>
        )}
        {loading ? (
          <p className={styles.loading}>Загрузка отзывов...</p>
        ) : (
          <ul className={styles.list}>
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard {...review} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Оставить отзыв"
      >
        <ReviewFormModal onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
