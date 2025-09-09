import { apiService } from './api';
import { mockService } from './mockService';

const USE_MOCK_API = true;

export const adminService = {
  // Auth
  login: USE_MOCK_API ? mockService.login : (credentials) => apiService.post('/auth/login', credentials),
  
  // Products
  getProducts: USE_MOCK_API ? mockService.getProducts : (params) => apiService.get('/products', { params }),
  getProduct: USE_MOCK_API ? mockService.getProduct : (id) => apiService.get(`/products/${id}`),
  createProduct: USE_MOCK_API ? mockService.createProduct : (data) => apiService.post('/products', data),
  updateProduct: USE_MOCK_API ? mockService.updateProduct : (id, data) => apiService.put(`/products/${id}`, data),
  deleteProduct: USE_MOCK_API ? mockService.deleteProduct : (id) => apiService.delete(`/products/${id}`),

  // Orders
  getOrders: USE_MOCK_API ? mockService.getOrders : (params) => apiService.get('/orders', { params }),
  getOrder: USE_MOCK_API ? mockService.getOrder : (id) => apiService.get(`/orders/${id}`),
  updateOrderStatus: USE_MOCK_API ? mockService.updateOrderStatus : (id, status) => apiService.patch(`/orders/${id}`, { status }),

  // Categories
  getCategories: USE_MOCK_API ? mockService.getCategories : () => apiService.get('/categories'),
  getCategory: USE_MOCK_API ? mockService.getCategory : (id) => apiService.get(`/categories/${id}`),
  createCategory: USE_MOCK_API ? mockService.createCategory : (data) => apiService.post('/categories', data),
  updateCategory: USE_MOCK_API ? mockService.updateCategory : (id, data) => apiService.put(`/categories/${id}`, data),
  deleteCategory: USE_MOCK_API ? mockService.deleteCategory : (id) => apiService.delete(`/categories/${id}`),

  // Dashboard
  getDashboardStats: USE_MOCK_API ? mockService.getDashboardStats : () => apiService.get('/dashboard/stats'),

  // Users
  getUsers: USE_MOCK_API ? mockService.getUsers : () => apiService.get('/admin/users'),
  getUser: USE_MOCK_API ? mockService.getUser : (id) => apiService.get(`/admin/users/${id}`),
  updateUser: USE_MOCK_API ? mockService.updateUser : (id, data) => apiService.put(`/admin/users/${id}`, data),
  deleteUser: USE_MOCK_API ? mockService.deleteUser : (id) => apiService.delete(`/admin/users/${id}`),
};