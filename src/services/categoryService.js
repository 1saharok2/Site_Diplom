// Mock данные категорий
const mockCategories = [
  {
    id: 1,
    name: 'Смартфоны',
    slug: 'smartphones',
    description: 'Смартфоны, кнопочные телефоны и аксессуары',
    image: '/src/assets/Categories/Smartphones.jpg',
    productCount: 156
  },
  {
    id: 2,
    name: 'Ноутбуки',
    slug: 'laptops',
    description: 'Ноутбуки, ультрабуки и игровые устройства',
    image: 'https://via.placeholder.com/400x300/28a745/ffffff?text=💻+Ноутбуки',
    productCount: 89
  },
  {
    id: 3,
    name: 'Телевизоры',
    slug: 'tvs',
    description: 'Телевизоры, мониторы и медиатехника',
    image: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=📺+Телевизоры',
    productCount: 67
  },
  {
    id: 4,
    name: 'Наушники',
    slug: 'headphones',
    description: 'Наушники, гарнитуры и аудиотехника',
    image: 'https://via.placeholder.com/400x300/6f42c1/ffffff?text=🎧+Наушники',
    productCount: 124
  },
  {
    id: 5,
    name: 'Фототехника',
    slug: 'photo',
    description: 'Фотоаппараты, объективы и аксессуары',
    image: 'https://via.placeholder.com/400x300/fd7e14/ffffff?text=📸+Фототехника',
    productCount: 78
  },
  {
    id: 6,
    name: 'Игровые консоли',
    slug: 'gaming',
    description: 'Игровые приставки, игры и аксессуары',
    image: 'https://via.placeholder.com/400x300/20c997/ffffff?text=🎮+Консоли',
    productCount: 45
  },
  {
    id: 7,
    name: 'Бытовая техника',
    slug: 'appliances',
    description: 'Холодильники, стиральные машины и техника для дома',
    image: 'https://via.placeholder.com/400x300/6c757d/ffffff?text=🏠+Техника',
    productCount: 203
  },
  {
    id: 8,
    name: 'Умный дом',
    slug: 'smart-home',
    description: 'Умные устройства для автоматизации дома',
    image: 'https://via.placeholder.com/400x300/0dcaf0/000000?text=🏠+Умный+дом',
    productCount: 92
  }
];

// Mock данные товаров
const mockProducts = [
  // Смартфоны
  {
    id: 1,
    name: 'Смартфон Apple iPhone 16',
    price: 79990,
    oldPrice: 84900,
    images: ['src/assets/Photos/Phones/iphone.png'],
    category: 'smartphones',
    rating: 4.0,
    reviewsCount: 128,
    isNew: true,
    discount: 6,
    inStock: true,
    description: 'Новый iPhone 16 с улучшенной камерой'
  },
  {
    id: 2, 
    name: 'Смартфон Samsung Galaxy S23 Ultra',
    price: 89900,
    oldPrice: 99900,
    images: ['https://via.placeholder.com/400x400/1428a0/ffffff?text=Galaxy+S23'],
    category: 'smartphones',
    rating: 4.5,
    reviewsCount: 256,
    isNew: false,
    discount: 10,
    inStock: true,
    description: 'Флагманский смартфон Samsung с S-Pen'
  },
  {
    id: 3,
    name: 'Смартфон Xiaomi Redmi Note 13',
    price: 24990,
    oldPrice: 29990,
    images: ['https://via.placeholder.com/400x400/ff6900/ffffff?text=Redmi+Note+13'],
    category: 'smartphones',
    rating: 4.2,
    reviewsCount: 189,
    isNew: true,
    discount: 17,
    inStock: true,
    description: 'Бюджетный смартфон с отличной камерой'
  },

  // Ноутбуки
  {
    id: 4,
    name: 'Ноутбук Apple MacBook Pro 16"',
    price: 199990,
    oldPrice: 219990,
    images: ['https://via.placeholder.com/400x400/000000/ffffff?text=MacBook+Pro'],
    category: 'laptops',
    rating: 4.8,
    reviewsCount: 89,
    isNew: false,
    discount: 9,
    inStock: true,
    description: 'Профессиональный ноутбук для творческих задач'
  },
  {
    id: 5,
    name: 'Ноутбук ASUS ROG Strix',
    price: 129990,
    oldPrice: 149990,
    images: ['https://via.placeholder.com/400x400/ff0000/ffffff?text=ROG+Strix'],
    category: 'laptops',
    rating: 4.6,
    reviewsCount: 67,
    isNew: true,
    discount: 13,
    inStock: true,
    description: 'Игровой ноутбук с мощной видеокартой'
  },

  // Телевизоры
  {
    id: 6,
    name: 'Телевизор Samsung QLED 65"',
    price: 89990,
    oldPrice: 109990,
    images: ['https://via.placeholder.com/400x400/1428a0/ffffff?text=QLED+65'],
    category: 'tvs',
    rating: 4.7,
    reviewsCount: 145,
    isNew: false,
    discount: 18,
    inStock: true,
    description: '4K телевизор с технологией QLED'
  },

  // Наушники
  {
    id: 7,
    name: 'Наушники Sony WH-1000XM5',
    price: 29990,
    oldPrice: 34990,
    images: ['https://via.placeholder.com/400x400/000000/ffffff?text=SONY+XM5'],
    category: 'headphones',
    rating: 4.9,
    reviewsCount: 312,
    isNew: true,
    discount: 14,
    inStock: true,
    description: 'Беспроводные наушники с шумоподавлением'
  }
];

// API функции
export const getCategories = async () => {
  return mockCategories;
};

export const getCategoryBySlug = async (slug) => {
  return mockCategories.find(category => category.slug === slug);
};

export const getProductsByCategory = async (slug) => {
  return mockProducts.filter(product => product.category === slug);
};

export const getProductById = async (id) => {
  return mockProducts.find(product => product.id === parseInt(id));
};