// Mock данные категорий
const mockCategories = [
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
  }
];

// Mock данные товаров
const mockProducts = [
  {
    id: 1,
    name: 'Смартфон Samsung Galaxy S23 Ultra',
    price: 89990,
    oldPrice: 99990,
    images: ['/images/products/phone1.jpg'],
    category: 'electronics',
    rating: 4.5,
    reviewsCount: 124,
    isNew: true,
    discount: 10,
    inStock: true
  },
  {
    id: 2,
    name: 'Футболка хлопковая',
    price: 1990,
    oldPrice: 2490,
    images: ['/images/products/tshirt1.jpg'],
    category: 'clothing',
    rating: 4.2,
    reviewsCount: 67,
    isNew: true,
    discount: 20,
    inStock: true
  },
    {
    id: 3,
    name: 'Смартфон Samsung Galaxy S23 Ultra',
    price: 89990,
    oldPrice: 99990,
    images: ['/images/products/phone1.jpg'],
    category: 'electronics',
    rating: 4.5,
    reviewsCount: 124,
    isNew: true,
    discount: 10,
    inStock: true
  },
    {
    id: 4,
    name: 'Смартфон Apple iphone 16',
    price: 79990,
    oldPrice: 89990,
    images: ['./src/assets/Photos/Phones/free-png.ru-hero_endframe-dtznvlokjeeu_xlarge.png'],
    category: 'electronics',
    rating: 4.0,
    reviewsCount: 124,
    isNew: true,
    discount: 10,
    inStock: true
  },
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