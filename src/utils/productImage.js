/** Первое изображение товара для списков (поиск, шапка и т.д.) — API отдаёт images / image_url */
export function getProductThumbnailSrc(product, fallback = '/images/placeholder.jpg') {
  if (!product) return fallback;

  let images = product.images;
  if (typeof images === 'string' && images.trim()) {
    const t = images.trim();
    if (t[0] === '[' || t[0] === '"') {
      try {
        const parsed = JSON.parse(images);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        images = [images];
      }
    } else {
      images = [images];
    }
  }

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
