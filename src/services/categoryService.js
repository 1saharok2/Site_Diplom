// Mock service - замените на реальные API вызовы
export const getCategories = async () => {
  // Здесь будет реальный API вызов
  return [
    {
      id: 1,
      name: 'Электроника',
      slug: 'electronics',
      description: 'Смартфоны, ноутбуки, планшеты и другая электроника',
      image: '/images/categories/electronics.jpg',
      productCount: 156
    },
    {
      id: 2,
      name: 'Одежда',
      slug: 'clothing',
      description: 'Модная одежда для всех возрастов',
      image: '/images/categories/clothing.jpg',
      productCount: 234
    },
    // ... другие категории
  ];
};

export const getCategoryBySlug = async (slug) => {
  const categories = await getCategories();
  return categories.find(cat => cat.slug === slug);
};

export const getProductsByCategory = async (slug) => {
  // Здесь будет реальный API вызов
  return [
    {
      id: 1,
      name: 'Смартфон Samsung Galaxy S23',
      price: 79990,
      oldPrice: 89990,
      images: ['/images/products/phone1.jpg'],
      category: 'electronics',
      rating: 4.5,
      reviewsCount: 124,
      isNew: true,
      discount: 11,
      inStock: true,
      description: 'Мощный смартфон с лучшей камерой',
      specifications: [
        { key: 'Экран', value: '6.1"' },
        { key: 'Память', value: '256 ГБ' },
        { key: 'Камера', value: '50 Мп' }
      ]
    },
    // ... другие товары
  ];
};