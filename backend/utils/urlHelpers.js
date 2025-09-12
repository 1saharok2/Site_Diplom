// src/utils/urlHelpers.js
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const ensureValidImageUrl = (url, fallback = null) => {
  return isValidUrl(url) ? url : fallback;
};