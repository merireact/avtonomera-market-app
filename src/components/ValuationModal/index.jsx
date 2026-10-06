import { Modal } from '../Modal';
import styles from './index.module.scss';

const PHONE_HREF = 'tel:+79995999177';
const TELEGRAM_URL = `https://t.me/nomeramarket_direct?text=${encodeURIComponent('Здравствуйте, хочу оценить номер')}`;

export function ValuationModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Оценка вашего номера">
      <div className={styles.body}>
        <p className={styles.text}>
          Мы можем выкупить ваш номер или взять его на реализацию и найти клиента. Для этого обратитесь к нам.
        </p>
        <div className={styles.actions}>
          <a href={PHONE_HREF} className={styles.contactBtn}>
            Позвонить
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
            Написать в Telegram
          </a>
        </div>
      </div>
    </Modal>
  );
}
