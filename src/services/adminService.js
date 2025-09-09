import { apiService } from './api';

const API_BASE = 'http://localhost:5000/api';

export const adminService = {

  login: (credentials) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(res => res.json()),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()),

  // Products
  getProducts: () => 
    fetch(`${API_BASE}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).then(res => {
      if (!res.ok) throw new Error('Ошибка загрузки товаров');
      return res.json();
    }),

  createProduct: (productData) =>
    fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(productData)
    }).then(res => {
      if (!res.ok) throw new Error('Ошибка создания товара');
      return res.json();
    }),

  updateProduct: (id, productData) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(productData)
    }).then(res => {
      if (!res.ok) throw new Error('Ошибка обновления товара');
      return res.json();
    }),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).then(res => {
      if (!res.ok) throw new Error('Ошибка удаления товара');
      return res.json();
    }),

  // Orders
  getOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders`);
      if (!response.ok) throw new Error('Ошибка загрузки заказов');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Ошибка обновления статуса');
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Categories
  getCategories: () => apiService.getCategories(),

  // Users
  getUsers: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('Токен не найден');
        return []; // Возвращаем пустой массив
      }

      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Проверяем статус ответа
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        return []; // Возвращаем пустой массив при ошибке
      }
      
      const data = await response.json();
      console.log('Raw response data:', data);
      
      // ✅ УНИВЕРСАЛЬНЫЙ ПАРСЕР ДЛЯ ЛЮБОГО ФОРМАТА ОТВЕТА
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.users)) {
        return data.users;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else if (data && data.success && Array.isArray(data.result)) {
        return data.result;
      }
      
      // Если ни один формат не подошел
      console.warn('Неизвестный формат ответа:', data);
      return [];
      
    } catch (error) {
      console.error('Network error:', error);
      return []; // Всегда возвращаем массив
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }
};