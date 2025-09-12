const API_BASE = 'http://localhost:5000/api';

const handleApiResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Требуется авторизация');
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  if (data && Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && data.success !== undefined && data.data) {
    return data.data;
  } else if (data && data.users) {
    return data.users;
  } else if (data && data.products) {
    return data.products;
  }
  
  return data || [];
};

const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }
  return token;
};

// Универсальный метод для GET запросов
const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = getAuthToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`Ошибка запроса к ${url}:`, error);
    throw error;
  }
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
    return fetchWithAuth(`${API_BASE}/admin/products`);
  },

  createProduct: async (productData) => {
    return fetchWithAuth(`${API_BASE}/admin/products`, {
      method: 'POST',
      body: JSON.stringify({
        ...productData,
        images: Array.isArray(productData.images) ? productData.images : []
      })
    });
  },

  updateProduct: async (id, productData) => {
    return fetchWithAuth(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return fetchWithAuth(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  getOrders: async () => {
    return fetchWithAuth(`${API_BASE}/admin/orders`);
  },

  updateOrderStatus: async (orderId, status) => {
    return fetchWithAuth(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Categories
  getCategories: async () => {
    return fetchWithAuth(`${API_BASE}/admin/categories`);
  },

  // Users
  getUsers: async () => {
    return fetchWithAuth(`${API_BASE}/admin/users`);
  },

  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
      throw new Error('Токен не найден');
      }

      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
      }
    
      const data = await response.json();
      console.log('📊 Данные статистики от сервера:', data);
    
    // Разные варианты структуры ответа
      return {
        totalOrders: data.totalOrders || data.orders_count || data.orders || 0,
        totalProducts: data.totalProducts || data.products_count || data.products || 0,
        totalUsers: data.totalUsers || data.users_count || data.users || 0,
        totalSales: data.totalSales || data.sales_total || data.sales || 0,
        recentOrders: data.recentOrders || data.last_orders || data.orders || []
      }; 
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error);
    }
  }
}