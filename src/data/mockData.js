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