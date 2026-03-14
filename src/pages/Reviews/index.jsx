import { ReviewCard } from '../../components/ReviewCard';
import { Button } from '../../components/Button';
import reviewsData from '../../data/reviews.json';
import styles from './index.module.scss';

export function Reviews() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Отзывы</h1>
      </header>
      <main className={styles.main}>
        <ul className={styles.list}>
          {reviewsData.map((review) => (
            <li key={review.id}>
              <ReviewCard {...review} />
            </li>
          ))}
        </ul>
        <div className={styles.leaveReview}>
          <Button variant="secondary">Оставить отзыв</Button>
        </div>
      </main>
    </div>
  );
}
