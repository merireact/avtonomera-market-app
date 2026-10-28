export const PHONE_NUMBER = '+79995999177';
export const PHONE_LABEL = '+7 999 599-91-77';
export const PHONE_HREF = `tel:${PHONE_NUMBER}`;

/**
 * Telegram WebView блокирует tel:-ссылки (особенно на iOS), поэтому внутри
 * мини-приложения открываем страницу-редирект во внешнем браузере — она
 * сразу передаёт номер в звонилку телефона.
 */
export function handlePhoneClick(event) {
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.initData || typeof webApp.openLink !== 'function') return;
  event.preventDefault();
  const base = `${window.location.origin}${process.env.PUBLIC_URL || ''}`;
  webApp.openLink(`${base}/call.html?tel=${encodeURIComponent(PHONE_NUMBER)}`);
}
