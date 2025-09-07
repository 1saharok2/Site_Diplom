export const mockProducts = [
  {
    id: 1,
    name: "Смартфон Samsung Galaxy S23",
    price: 69990,
    oldPrice: 79990,
    image: "src/assets/Categories/Smartphones.jpg",
    category: "smartphones",
    stock: 15,
    sku: "SM-S23-BLK",
    rating: 4.8,
    description: "Флагманский смартфон с лучшей камерой",
    specifications: {
      screen: "6.1'' Dynamic AMOLED",
      memory: "256GB",
      camera: "50MP + 12MP + 10MP",
      battery: "3900mAh"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Ноутбук ASUS ROG Strix",
    price: 89990,
    oldPrice: 99990,
    image: "/images/products/asus-rog.jpg",
    category: "laptops",
    stock: 8,
    sku: "ASUS-ROG-G15",
    rating: 4.7,
    description: "Игровой ноутбук премиум-класса",
    specifications: {
      screen: "15.6'' IPS",
      processor: "Intel Core i7",
      memory: "16GB DDR5",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4060"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-20T14:30:00Z"
  },
  {
    id: 3,
    name: "Наушники Sony WH-1000XM5",
    price: 29990,
    oldPrice: 34990,
    image: "/images/products/sony-xm5.jpg",
    category: "headphones",
    stock: 25,
    sku: "SONY-XM5-BLK",
    rating: 4.9,
    description: "Беспроводные наушники с шумоподавлением",
    specifications: {
      type: "Накладные",
      battery: "30 часов",
      connectivity: "Bluetooth 5.2",
      weight: "250g"
    },
    isActive: true,
    isFeatured: true,
    createdAt: "2024-01-25T09:15:00Z"
  },
  {
    id: 4,
    name: "Apple Watch Series 9",
    price: 39990,
    oldPrice: 44990,
    image: "/images/products/apple-watch.jpg",
    category: "accessories",
    stock: 20,
    sku: "AW-S9-45MM",
    rating: 4.6,
    description: "Умные часы премиум-класса",
    specifications: {
      screen: "1.9'' Retina",
      battery: "18 часов",
      connectivity: "Bluetooth, Wi-Fi",
      waterResistance: "50m"
    },
    isActive: true,
    isFeatured: false,
    createdAt: "2024-02-01T11:45:00Z"
  }
];

export const mockOrders = [
  {
    id: 1,
    customerName: "Иван Иванов",
    customerEmail: "ivan@mail.com",
    customerPhone: "+7 (999) 123-45-67",
    total: 139980,
    status: "completed",
    paymentMethod: "card",
    shippingAddress: {
      city: "Москва",
      address: "ул. Примерная, д. 123, кв. 45"
    },
    items: [
      {
        productId: 1,
        name: "Смартфон Samsung Galaxy S23",
        price: 69990,
        quantity: 2,
        image: "https://via.placeholder.com/300x300?text=Samsung+S23"
      }
    ],
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T16:45:00Z"
  }
];

export const mockCategories = [
  {
    id: 1,
    name: "Смартфоны",
    slug: "smartphones",
    description: "Мобильные телефоны и смартфоны",
    image: "https://via.placeholder.com/300x200?text=Смартфоны",
    isActive: true
  },
  {
    id: 2,
    name: "Ноутбуки",
    slug: "laptops",
    description: "Ноутбуки и ультрабуки",
    image: "https://via.placeholder.com/300x200?text=Ноутбуки",
    isActive: true
  },
  {
    id: 3,
    name: "Наушники",
    slug: "headphones",
    description: "Наушники и гарнитуры",
    image: "/images/categories/headphones.jpg",
    isActive: true
  },
  {
    id: 4,
    name: "Аксессуары",
    slug: "accessories",
    description: "Аксессуары для техники",
    image: "/images/categories/accessories.jpg",
    isActive: true
  }
];

export const mockUsers = [
  {
    id: 1,
    email: "admin@mail.com",
    password: "admin123",
    role: "admin",
    name: "Администратор",
    avatar: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    email: "user@mail.com",
    password: "user123",
    role: "user",
    name: "Иван Иванов",
    avatar: null,
    isActive: true,
    createdAt: "2024-01-10T12:00:00Z"
  }
];