// Функции для преобразования данных товаров
const processProductForDb = (productData) => {
  const processed = { ...productData };
  
  // Преобразуем price в число
  if (processed.price) {
    processed.price = typeof processed.price === 'string' 
      ? parseFloat(processed.price) 
      : processed.price;
  }
  
  // Преобразуем images в JSON строку
  if (Array.isArray(processed.images)) {
    processed.images = JSON.stringify(processed.images);
  }
  
  // Преобразуем discount в число
  if (processed.discount) {
    processed.discount = typeof processed.discount === 'string'
      ? parseInt(processed.discount)
      : processed.discount;
  }
  
  // Преобразуем stock в число
  if (processed.stock) {
    processed.stock = typeof processed.stock === 'string'
      ? parseInt(processed.stock)
      : processed.stock;
  }
  
  // Преобразуем reviews_count в число
  if (processed.reviews_count) {
    processed.reviews_count = typeof processed.reviews_count === 'string'
      ? parseInt(processed.reviews_count)
      : processed.reviews_count;
  }
  
  // Преобразуем rating в число
  if (processed.rating) {
    processed.rating = typeof processed.rating === 'string'
      ? parseFloat(processed.rating)
      : processed.rating;
  }
  
  // Преобразуем булевы значения
  if (typeof processed.is_new === 'string') {
    processed.is_new = processed.is_new === 'true';
  }
  if (typeof processed.in_stock === 'string') {
    processed.in_stock = processed.in_stock === 'true';
  }
  if (typeof processed.is_active === 'string') {
    processed.is_active = processed.is_active === 'true';
  }
  
  return processed;
};

const processProductFromDb = (productData) => {
  if (!productData) return null;
  
  const processed = { ...productData };
  
  // Преобразуем images из JSON строки в массив
  if (processed.images && typeof processed.images === 'string') {
    try {
      processed.images = JSON.parse(processed.images);
    } catch (e) {
      processed.images = [processed.images];
    }
  }
  
  // Убеждаемся, что images всегда массив
  if (!Array.isArray(processed.images)) {
    processed.images = [];
  }
  
  return processed;
};

module.exports = {
  processProductForDb,
  processProductFromDb
};