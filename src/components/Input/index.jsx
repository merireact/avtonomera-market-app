import styles from './index.module.scss';

export function Input({ placeholder, value, onChange, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      className={`${styles.input} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
