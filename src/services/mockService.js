// Mock данные и функции
import { mockProducts, mockOrders, mockCategories, mockUsers } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  login: async (credentials) => {
    await delay(1000);
    
    console.log('Вход с данными:', credentials);

    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password);

    if (user) {
      return {
        data: {
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role },
          token: 'mock-jwt-token'
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  getProducts: async (params = {}) => {
    await delay(500);
    let products = [...mockProducts];
    
    if (params.category) {
      products = products.filter(p => p.category === params.category);
    }
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }
    if (params.sort) {
      switch (params.sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    return { data: products };
  },

  getProduct: async (id) => {
    await delay(300);
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (product) {
      return { data: product };
    }
    throw new Error('Товар не найден');
  },

  createProduct: async (productData) => {
    await delay(500);
    const newProduct = {
      ...productData,
      id: Math.max(...mockProducts.map(p => p.id)) + 1,
      createdAt: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return { data: newProduct };
  },

  updateProduct: async (id, productData) => {
    await delay(500);
    const index = mockProducts.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return { data: mockProducts[index] };
    }
    throw new Error('Product not found');
  },

  deleteProduct: async (id) => {
    await delay(500);
    const index = mockProducts.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return { data: { success: true } };
    }
    throw new Error('Product not found');
  },

  searchProducts: async (searchTerm, params = {}) => {
    await delay(400);
    let products = [...mockProducts];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    return { data: products };
  },

  getProductsByCategory: async (categorySlug, params = {}) => {
    await delay(400);
    const products = mockProducts.filter(p => p.category === categorySlug);
    return { data: products };
  },

  getPopularProducts: async (limit = 8) => {
    await delay(300);
    const popularProducts = [...mockProducts]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
    return { data: popularProducts };
  },

  getNewProducts: async (limit = 8) => {
    await delay(300);
    const newProducts = [...mockProducts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    return { data: newProducts };
  },

  getDiscountedProducts: async (limit = 8) => {
    await delay(300);
    const discountedProducts = mockProducts
      .filter(p => p.oldPrice && p.oldPrice > p.price)
      .slice(0, limit);
    return { data: discountedProducts };
  },

  getOrders: async () => {
    await delay(500);
    return { data: mockOrders };
  },

  getOrder: async (id) => {
  await delay(300);
  const order = mockOrders.find(o => o.id === parseInt(id));
  if (order) {
    return { data: order };
  }
  throw new Error('Order not found');
  },

  updateOrderStatus: async (id, status) => {
    await delay(500);
    const order = mockOrders.find(o => o.id === parseInt(id));
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return { data: order };
    }
    throw new Error('Order not found');
  },

  getCategories: async () => {
    await delay(300);
    return { data: mockCategories };
  },

  createCategory: async (categoryData) => {
    await delay(500);
    const newCategory = {
      ...categoryData,
      id: Math.max(...mockCategories.map(c => c.id)) + 1
    };
    mockCategories.push(newCategory);
    return { data: newCategory };
  },

  getDashboardStats: async () => {
    await delay(300);
    return {
      data: {
        totalSales: mockOrders.reduce((sum, order) => sum + order.total, 0),
        totalOrders: mockOrders.length,
        totalProducts: mockProducts.length,
        totalUsers: mockUsers.length,
        recentOrders: mockOrders.slice(0, 5)
      }
    };
  },

  getUsers: async () => {
    await delay(500);
    return { data: mockUsers };
  },

  getUser: async (id) => {
    await delay(300);
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (user) {
      return { data: user };
    }
    throw new Error('User not found');
  },

  updateUser: async (id, userData) => {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return { data: mockUsers[index] };
    }
    throw new Error('User not found');
  },

  deleteUser: async (id) => {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === parseInt(id));
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return { data: { success: true } };
    }
    throw new Error('User not found');
  }
};