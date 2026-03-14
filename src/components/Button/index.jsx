import styles from './index.module.scss';

export function Button({ children, variant = 'primary', onClick, type = 'button', className = '', disabled }) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
