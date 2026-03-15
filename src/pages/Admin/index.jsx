import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { addNumber as apiAddNumber } from '../../api/numbers';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import styles from './index.module.scss';

const DEFAULT_STATUS = 'Свободен';

export function Admin() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const [number, setNumber] = useState('');
  const [city, setCity] = useState('Москва');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [vip, setVip] = useState(false);
  const [sameDigits, setSameDigits] = useState(false);
  const [sameLetters, setSameLetters] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!supabase) {
      setAuthError(new Error('Supabase не настроен'));
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setAuthError(error);
      return;
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    const num = number.trim();
    if (!num) {
      setSubmitError(new Error('Укажите номер'));
      return;
    }
    setSubmitLoading(true);
    const priceVal = price.trim() === '' || price.trim().toLowerCase() === 'договорная' ? 'договорная' : price.trim();
    const { error } = await apiAddNumber({
      number: num,
      city: city.trim() || 'Москва',
      price: priceVal,
      status: status.trim() || DEFAULT_STATUS,
      vip,
      sameDigits,
      sameLetters,
      beautiful: false,
    });
    setSubmitLoading(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitSuccess(true);
    setNumber('');
    setPrice('');
    setVip(false);
    setSameDigits(false);
    setSameLetters(false);
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Проверка входа...</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>Supabase не настроен. Добавьте REACT_APP_SUPABASE_URL и REACT_APP_SUPABASE_ANON_KEY в .env.local</p>
        <Button onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Назад">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className={styles.title}>Вход для админа</h1>
        </header>
        <form className={styles.form} onSubmit={handleLogin}>
          {authError && <p className={styles.formError}>{authError.message}</p>}
          <label className={styles.label}>
            Email
            <Input type="email" value={email} onChange={setEmail} placeholder="email@example.com" required />
          </label>
          <label className={styles.label}>
            Пароль
            <Input type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
          </label>
          <Button type="submit" className={styles.submitBtn}>Войти</Button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Назад">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Добавить номер</h1>
        <Button variant="secondary" className={styles.logoutBtn} onClick={handleLogout}>Выйти</Button>
      </header>

      <form className={styles.form} onSubmit={handleAddNumber}>
        {submitError && <p className={styles.formError}>{submitError.message}</p>}
        {submitSuccess && <p className={styles.formSuccess}>Номер добавлен в каталог.</p>}

        <label className={styles.label}>
          Номер (например: Х777СА 777)
          <Input value={number} onChange={setNumber} placeholder="Х777СА 777" required />
        </label>
        <label className={styles.label}>
          Регион
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.select}
          >
            <option value="Москва">Москва</option>
            <option value="Московская область">Московская область</option>
          </select>
        </label>
        <label className={styles.label}>
          Цена (число или «договорная»)
          <Input value={price} onChange={setPrice} placeholder="400000 или договорная" />
        </label>
        <label className={styles.label}>
          Статус
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.select}
          >
            <option value="Свободен">Свободен</option>
            <option value="Забронирован">Забронирован</option>
          </select>
        </label>

        <div className={styles.checkboxes}>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} />
            <span>Эксклюзивный (VIP)</span>
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={sameDigits} onChange={(e) => setSameDigits(e.target.checked)} />
            <span>Одинаковые цифры</span>
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={sameLetters} onChange={(e) => setSameLetters(e.target.checked)} />
            <span>Одинаковые буквы</span>
          </label>
        </div>

        <Button type="submit" className={styles.submitBtn} disabled={submitLoading}>
          {submitLoading ? 'Добавляю...' : 'Добавить номер'}
        </Button>
      </form>
    </div>
  );
}
