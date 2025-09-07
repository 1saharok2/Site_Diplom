import api from './api';
import { mockService } from './mockService';

const USE_MOCK_API = true;

export const adminService = {
  // Auth
  login: USE_MOCK_API ? mockService.login : (credentials) => api.post('/auth/login', credentials),
  
  // Products
  getProducts: USE_MOCK_API ? mockService.getProducts : (params) => api.get('/products', { params }),
  getProduct: USE_MOCK_API ? mockService.getProduct : (id) => api.get(`/products/${id}`),
  createProduct: USE_MOCK_API ? mockService.createProduct : (data) => api.post('/products', data),
  updateProduct: USE_MOCK_API ? mockService.updateProduct : (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: USE_MOCK_API ? mockService.deleteProduct : (id) => api.delete(`/products/${id}`),

  // Orders
  getOrders: USE_MOCK_API ? mockService.getOrders : (params) => api.get('/orders', { params }),
  getOrder: USE_MOCK_API ? mockService.getOrder : (id) => api.get(`/orders/${id}`),
  updateOrderStatus: USE_MOCK_API ? mockService.updateOrderStatus : (id, status) => api.patch(`/orders/${id}`, { status }),

  // Categories
  getCategories: USE_MOCK_API ? mockService.getCategories : () => api.get('/categories'),
  getCategory: USE_MOCK_API ? mockService.getCategory : (id) => api.get(`/categories/${id}`),
  createCategory: USE_MOCK_API ? mockService.createCategory : (data) => api.post('/categories', data),
  updateCategory: USE_MOCK_API ? mockService.updateCategory : (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: USE_MOCK_API ? mockService.deleteCategory : (id) => api.delete(`/categories/${id}`),

  // Dashboard
  getDashboardStats: USE_MOCK_API ? mockService.getDashboardStats : () => api.get('/dashboard/stats'),
};