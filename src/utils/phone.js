export const PHONE_NUMBER = '+79995999177';
export const PHONE_LABEL = '+7 999 599-91-77';
export const PHONE_HREF = `tel:${PHONE_NUMBER}`;

/**
 * Внутри Telegram обычный переход по tel: WebView глотает молча. Ссылку,
 * открытую в новом окне, Telegram отдаёт системе — и сразу открывается
 * звонилка с набранным номером, без промежуточных страниц.
 */
export function handlePhoneClick(event) {
  if (!window.Telegram?.WebApp?.initData) return;
  event.preventDefault();
  window.open(PHONE_HREF, '_blank');
}
