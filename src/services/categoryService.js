// Mock данные категорий
//import phone1 from '../../assets/Photos/Phones/free-png.ru-hero_endframe-dtznvlokjeeu_xlarge.png';
const mockCategories = [
  {
    id: 1,
    name: 'Электроника',
    slug: 'electronics',
    description: 'Смартфоны, ноутбуки, планшеты и другая электроника',
    image: '/images/categories/electronics.jpg',
    productCount: 156
  },
  
];

// Mock данные товаров
const mockProducts = [
  {
    id: 0,
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
    name: 'Смартфон Apple iphone 16',
    price: 79990,
    oldPrice: 89990,
    images: ["./images/phones/iphone.png"], 
    category: 'electronics',
    rating: 4.0,
    reviewsCount: 124,
    isNew: true,
    discount: 10,
    inStock: true
  },
  {
    id: 3,
    name: 'Смартфон Samsung Galaxy Z Fold5',
    price: 129900,
    oldPrice: 149900,
    images: ['https://via.placeholder.com/400x400/6f42c1/ffffff?text=Z+Fold5'],
    category: 'electronics', 
    rating: 4.3,
    reviewsCount: 89,
    isNew: true,
    discount: 13,
    inStock: true,
    description: 'Складной смартфон премиум класса'
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