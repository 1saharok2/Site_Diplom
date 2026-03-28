/** Логи только в development — без лишней работы в production */
export const IS_DEV = process.env.NODE_ENV === 'development';

export function devLog(...args) {
  if (IS_DEV) console.log(...args);
}

export function devWarn(...args) {
  if (IS_DEV) console.warn(...args);
}
