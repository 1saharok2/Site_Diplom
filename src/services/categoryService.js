import React from 'react';
// Импортируем все изображений категорий
import smartphonesImg from '../assets/Categories/Smartphones.jpg';

// Импорты изображений телефонов
import googlePixel8Pro from '../assets/products/Phones/Google_Pixel_8_Pro.png';
import huaweiP60Pro from '../assets/products/Phones/Huawei P60 Pro.png';
import iphone from '../assets/products/Phones/iphone.png';
import nothingPhone2 from '../assets/products/Phones/Nothing Phone 2.png';
import onePlus12 from '../assets/products/Phones/OnePlus 12.png';
import oppoFindX6 from '../assets/products/Phones/Oppo Find X6.png';
import realmeGT3 from '../assets/products/Phones/Realme GT 3.png';
import samsungGalaxyS23Ultra from '../assets/products/Phones/Samsung Galaxy S23 Ultra.png';
import vivoX90Pro from '../assets/products/Phones/Vivo X90 Pro.png';
import xiaomiRedmiNote13 from '../assets/products/Phones/Xiaomi Redmi Note 13.png';


const mockCategories = [
  {
    id: 1,
    name: 'Смартфоны',
    slug: 'smartphones',
    description: 'Смартфоны, кнопочные телефоны и аксессуары',
    image: smartphonesImg, 
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
    images: [iphone],
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
    images: [samsungGalaxyS23Ultra],
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
    images: [xiaomiRedmiNote13],
    category: 'smartphones',
    rating: 4.2,
    reviewsCount: 189,
    isNew: true,
    discount: 17,
    inStock: true,
    description: 'Бюджетный смартфон с отличной камерой'
  },
  {
    id: 4,
    name: 'Смартфон Google Pixel 8 Pro',
    price: 89990,
    oldPrice: 99990,
    images: [googlePixel8Pro],
    category: 'smartphones',
    rating: 4.7,
    reviewsCount: 89,
    isNew: true,
    discount: 10,
    inStock: true,
    description: 'Флагман от Google с искуственным интеллектом'
  },
  {
    id: 5,
    name: 'Смартфон OnePlus 12',
    price: 69990,
    oldPrice: 79990,
    images: [onePlus12],
    category: 'smartphones',
    rating: 4.6,
    reviewsCount: 156,
    isNew: true,
    discount: 12,
    inStock: true,
    description: 'Мощный смартфон с быстрой зарядкой'
  },
  {
    id: 6,
    name: 'Смартфон Huawei P60 Pro',
    price: 84990,
    oldPrice: 94990,
    images: [huaweiP60Pro],
    category: 'smartphones',
    rating: 4.5,
    reviewsCount: 78,
    isNew: false,
    discount: 11,
    inStock: true,
    description: 'Премиальный смартфон с лучшей камерой'
  },
  {
    id: 7,
    name: 'Смартфон Realme GT 3',
    price: 39990,
    oldPrice: 49990,
    images: [realmeGT3],
    category: 'smartphones',
    rating: 4.3,
    reviewsCount: 234,
    isNew: true,
    discount: 20,
    inStock: true,
    description: 'Игровой смартфон с мощным процессором'
  },
  {
    id: 8,
    name: 'Смартфон Vivo X90 Pro',
    price: 79990,
    oldPrice: 89990,
    images: [vivoX90Pro],
    category: 'smartphones',
    rating: 4.4,
    reviewsCount: 67,
    isNew: true,
    discount: 11,
    inStock: true,
    description: 'Смартфон с инновационной камерой'
  },
  {
    id: 9,
    name: 'Смартфон Oppo Find X6',
    price: 74990,
    oldPrice: 84990,
    images: [oppoFindX6],
    category: 'smartphones',
    rating: 4.5,
    reviewsCount: 92,
    isNew: true,
    discount: 12,
    inStock: true,
    description: 'Стильный флагман с AMOLED дисплеем'
  },
  {
    id: 10,
    name: 'Смартфон Nothing Phone (2)',
    price: 54990,
    oldPrice: 64990,
    images: [nothingPhone2],
    category: 'smartphones',
    rating: 4.2,
    reviewsCount: 187,
    isNew: true,
    discount: 15,
    inStock: true,
    description: 'Уникальный дизайн с светодиодной подсветкой'
  },
{
  id: 11,
  name: 'Смартфон Motorola Edge 40',
  price: 44990,
  oldPrice: 54990,
  images: ['https://via.placeholder.com/400x400/0f7f12/ffffff?text=Motorola+Edge'],
  category: 'smartphones',
  rating: 4.1,
  reviewsCount: 143,
  isNew: false,
  discount: 18,
  inStock: true,
  description: 'Надежный смартфон с чистым Android'
},
{
  id: 12,
  name: 'Смартфон Honor Magic 5',
  price: 59990,
  oldPrice: 69990,
  images: ['https://via.placeholder.com/400x400/00a2ff/ffffff?text=Honor+Magic+5'],
  category: 'smartphones',
  rating: 4.3,
  reviewsCount: 116,
  isNew: true,
  discount: 14,
  inStock: true,
  description: 'Мощный смартфон для творчества'
},
{
  id: 13,
  name: 'Смартфон ASUS ROG Phone 7',
  price: 89990,
  oldPrice: 99990,
  images: ['https://via.placeholder.com/400x400/ff0022/ffffff?text=ROG+Phone+7'],
  category: 'smartphones',
  rating: 4.8,
  reviewsCount: 201,
  isNew: true,
  discount: 10,
  inStock: true,
  description: 'Лучший игровой смартфон на рынке'
},
{
  id: 14,
  name: 'Смартфон Sony Xperia 1 V',
  price: 94990,
  oldPrice: 104990,
  images: ['https://via.placeholder.com/400x400/003791/ffffff?text=Xperia+1+V'],
  category: 'smartphones',
  rating: 4.6,
  reviewsCount: 54,
  isNew: true,
  discount: 10,
  inStock: true,
  description: 'Профессиональная камера для фотографов'
},
{
  id: 15,
  name: 'Смартфон ZTE Nubia Z50',
  price: 49990,
  oldPrice: 59990,
  images: ['https://via.placeholder.com/400x400/ff0000/ffffff?text=Nubia+Z50'],
  category: 'smartphones',
  rating: 4.0,
  reviewsCount: 89,
  isNew: true,
  discount: 17,
  inStock: true,
  description: 'Смартфон с уникальным дизайном'
},
{
  id: 16,
  name: 'Смартфон Tecno Camon 20',
  price: 19990,
  oldPrice: 24990,
  images: ['https://via.placeholder.com/400x400/00a2ff/ffffff?text=Tecno+Camon'],
  category: 'smartphones',
  rating: 3.9,
  reviewsCount: 267,
  isNew: false,
  discount: 20,
  inStock: true,
  description: 'Бюджетный смартфон с хорошей камерой'
},
{
  id: 17,
  name: 'Смартфон Infinix Note 30',
  price: 17990,
  oldPrice: 22990,
  images: ['https://via.placeholder.com/400x400/ff0000/ffffff?text=Infinix+Note'],
  category: 'smartphones',
  rating: 3.8,
  reviewsCount: 189,
  isNew: true,
  discount: 22,
  inStock: true,
  description: 'Большой экран и мощный аккумулятор'
},
{
  id: 18,
  name: 'Смартфон Nokia G50',
  price: 22990,
  oldPrice: 27990,
  images: ['https://via.placeholder.com/400x400/124191/ffffff?text=Nokia+G50'],
  category: 'smartphones',
  rating: 4.0,
  reviewsCount: 156,
  isNew: false,
  discount: 18,
  inStock: true,
  description: 'Надежный смартфон с чистым Android'
},
{
  id: 19,
  name: 'Смартфон LG Velvet 2',
  price: 39990,
  oldPrice: 49990,
  images: ['https://via.placeholder.com/400x400/a50034/ffffff?text=LG+Velvet'],
  category: 'smartphones',
  rating: 4.2,
  reviewsCount: 73,
  isNew: false,
  discount: 20,
  inStock: false,
  description: 'Стильный дизайн и качественный звук'
},
{
  id: 20,
  name: 'Смартфон Black Shark 5',
  price: 59990,
  oldPrice: 69990,
  images: ['https://via.placeholder.com/400x400/000000/ffffff?text=Black+Shark'],
  category: 'smartphones',
  rating: 4.5,
  reviewsCount: 134,
  isNew: true,
  discount: 14,
  inStock: true,
  description: 'Игровой смартфон с активным охлаждением'
},
{
  id: 21,
  name: 'Смартфон Sharp Aquos R7',
  price: 79990,
  oldPrice: 89990,
  images: ['https://via.placeholder.com/400x400/ff0000/ffffff?text=Aquos+R7'],
  category: 'smartphones',
  rating: 4.4,
  reviewsCount: 42,
  isNew: true,
  discount: 11,
  inStock: true,
  description: 'Японский флагман с лучшим дисплеем'
},
{
  id: 22,
  name: 'Смартфон CAT S62 Pro',
  price: 69990,
  oldPrice: 79990,
  images: ['https://via.placeholder.com/400x400/ff6a00/ffffff?text=CAT+S62'],
  category: 'smartphones',
  rating: 4.1,
  reviewsCount: 67,
  isNew: false,
  discount: 12,
  inStock: true,
  description: 'Защищенный смартфон для экстремальных условий'
},
{
  id: 23,
  name: 'Смартфон Fairphone 5',
  price: 54990,
  oldPrice: 64990,
  images: ['https://via.placeholder.com/400x400/00cc66/ffffff?text=Fairphone'],
  category: 'smartphones',
  rating: 4.3,
  reviewsCount: 98,
  isNew: true,
  discount: 15,
  inStock: true,
  description: 'Экологичный и ремонтопригодный смартфон'
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