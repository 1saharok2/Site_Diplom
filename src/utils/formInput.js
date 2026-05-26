/** Ограничения и нормализация ввода в формах (контакты, checkout). */

export const MAX_NAME_LEN = 50;
export const MAX_EMAIL_LEN = 100;
export const MAX_ADDRESS_LEN = 200;
export const MAX_MESSAGE_LEN = 2000;
export const MAX_PHONE_DIGITS = 11;

const NAME_INVALID = /[^a-zA-Zа-яА-ЯёЁ\s\-']/g;
const EMAIL_INVALID = /[^a-zA-Z0-9@._+\-]/g;
const ADDRESS_INVALID = /[^a-zA-Zа-яА-ЯёЁ0-9\s.,\-/#№()]/g;

export function sanitizeName(value, maxLen = MAX_NAME_LEN) {
  return String(value ?? '')
    .replace(NAME_INVALID, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, maxLen);
}

export function sanitizeEmail(value, maxLen = MAX_EMAIL_LEN) {
  return String(value ?? '')
    .replace(EMAIL_INVALID, '')
    .slice(0, maxLen);
}

/** Только цифры телефона РФ: 7 + 10 цифр */
export function sanitizePhoneDigits(value, maxDigits = MAX_PHONE_DIGITS) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith('7')) {
    digits = `7${digits}`;
  }

  return digits.slice(0, maxDigits);
}

/** Маска +7 (999) 999-99-99 для отображения в поле */
export function formatPhoneRu(value) {
  const digits = sanitizePhoneDigits(value);
  if (!digits) return '';

  const local = digits.startsWith('7') ? digits.slice(1) : digits;
  if (local.length === 0) return '+7';

  let out = '+7';
  if (local.length <= 3) return `${out} (${local}`;
  out += ` (${local.slice(0, 3)})`;
  if (local.length <= 6) return `${out} ${local.slice(3)}`;
  out += ` ${local.slice(3, 6)}`;
  if (local.length <= 8) return `${out}-${local.slice(6)}`;
  return `${out}-${local.slice(6, 8)}-${local.slice(8, 10)}`;
}

export function sanitizeAddress(value, maxLen = MAX_ADDRESS_LEN) {
  return String(value ?? '')
    .replace(ADDRESS_INVALID, '')
    .slice(0, maxLen);
}

export function sanitizeMessage(value, maxLen = MAX_MESSAGE_LEN) {
  return String(value ?? '').slice(0, maxLen);
}

export function sanitizeFormField(name, value) {
  switch (name) {
    case 'firstName':
    case 'lastName':
    case 'name':
      return sanitizeName(value);
    case 'email':
      return sanitizeEmail(value);
    case 'phone':
      return formatPhoneRu(value);
    case 'address':
      return sanitizeAddress(value);
    case 'message':
      return sanitizeMessage(value);
    default:
      return value;
  }
}
