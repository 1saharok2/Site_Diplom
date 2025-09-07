// Mock данные и функции
import { mockProducts, mockOrders, mockCategories, mockUsers } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  login: async (credentials) => {
    await delay(1000);
    
    console.log('Вход с данными:', credentials);

    //const user = mockUsers.find(u => 
      //u.email === credentials.email && 
      //u.password === credentials.password);

    //if (user) {
      return {
        data: {
          user: { 
            id: 1, 
            email: "admin@mail.com", 
            name: "Администратор", 
            role: "admin" },
          token: 'mock-jwt-token'
        }
      };
    //}

    throw new Error('Invalid credentials');
  },

  getProducts: async (params = {}) => {
    await delay(500);
    let products = [...mockProducts];
    
    if (params.category) {
      products = products.filter(p => p.category === params.category);
    }
    if (params.search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(params.search.toLowerCase())
      );
    }

    return { data: products };
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

  getOrders: async () => {
    await delay(500);
    return { data: mockOrders };
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
  }
};