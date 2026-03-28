/** Первое изображение товара для списков (поиск, шапка и т.д.) — API отдаёт images / image_url */
export function getProductThumbnailSrc(product, fallback = '/images/placeholder.jpg') {
  if (!product) return fallback;

  const images = product.images;
  if (Array.isArray(images) && images.length > 0) {
    const u = images[0];
    if (typeof u === 'string' && u.trim()) return u.trim();
  }

  const iu = product.image_url;
  if (typeof iu === 'string' && iu.trim()) return iu.trim();
  if (Array.isArray(iu) && iu.length > 0) {
    const u = iu[0];
    if (typeof u === 'string' && u.trim()) return u.trim();
  }

  if (product.image && typeof product.image === 'string' && product.image.trim()) {
    return product.image.trim();
  }

  return fallback;
}
