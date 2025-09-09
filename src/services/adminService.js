import { apiService } from './api';

const API_BASE = 'http://localhost:5000/api';

const handleSupabaseResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data && Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data; 
  } else if (data && data.success !== undefined) {
    return data.users || data.data || [];
  }
  return [];
};

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
  getProducts: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Ошибка загрузки товаров');
      
      const data = await response.json();
      // Supabase возвращает массив напрямую
      return Array.isArray(data) ? data : [];
      
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  createProduct: async (productData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({...productData,
          images: Array.isArray(productData.images) ? productData.images : []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания товара');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления товара');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка удаления товара');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

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
        return [];
      }

      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await handleSupabaseResponse(response);
      
    } catch (error) {
      console.error('Network error:', error);
      return [];
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Ошибка загрузки статистики');
    
    const data = await response.json();
    return {
      totalOrders: data.orders || 0,
      totalProducts: data.products || 0,
      totalUsers: data.users || 0,
      totalSales: data.sales || 0,
      recentOrders: data.recentOrders || []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
      return {
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalSales: 0,
        recentOrders: []
      };
    }
  }
};