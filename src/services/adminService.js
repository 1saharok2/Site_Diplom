const getApiBase = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  return 'https://electronic.tw1.ru/api';
};

const API_BASE = getApiBase();

console.log('🔧 AdminService API_BASE:', API_BASE);

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
  
  return response.json();
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Сессия истекла или токен невалиден');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

const fetchApi = async (url, options = {}) => {
  const fullUrl = `${API_BASE}${url}`;
  console.log('🔧 API request to:', fullUrl);
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return handleApiResponse(response);
};

export const adminService = {
  login: async (credentials) => {
    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      const userData = response.user || { 
        id: response.userId || 4, 
        email: credentials.email,
        role: 'admin' 
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id);
      console.log('✅ Данные для синхронизации сохранены:', { token: 'есть', userData: 'есть' });
    }
    
    return response;
  },

  register: (userData) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  // Products
  getProducts: async () => {
    try {
      const products = await fetchApi('/products');
      return products.map(product => ({
        ...product,
        images: product.image ? [product.image] : [],
        mainImage: product.image || ''
      }));
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const product = await fetchWithAuth('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return product;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const product = await fetchWithAuth(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      return product;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await fetchWithAuth(`/admin/products/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const categories = await fetchApi('/categories');
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to demo data
      return [];
    }
  },

  createCategory: async (categoryData) => {
    try {
      const category = await fetchWithAuth('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      return category;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const category = await fetchWithAuth(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
      });
      return category;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await fetchWithAuth(`/admin/categories/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  },

  // Users
  getUsers: async () => {
    return fetchWithAuth('/admin/users');
  },

  updateUser: async (id, userData) => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id) => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  getDashboardStats: async () => {
    try {
      const data = await fetchWithAuth('/admin/stats');
      console.log('📊 Stats data:', data);
      return {
        totalOrders: data.totalOrders || data.orders_count || data.orders || 0,
        totalProducts: data.totalProducts || data.products_count || data.products || 0,
        totalUsers: data.totalUsers || data.users_count || data.users || 0,
        totalSales: data.totalSales || data.sales_total || data.sales || 0,
        recentOrders: data.recentOrders || data.last_orders || data.orders || []
      }; 
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Fallback data
      return {
        totalOrders: 0,
        totalProducts: 0, 
        totalUsers: 0,
        totalSales: 0,
        recentOrders: []
      };
    }
  },

  // Orders (пока оставляем заглушки - реализуете позже)
  getOrders: async () => {
    try {
      const response = await fetchWithAuth('/admin/orders');
      return response.data || response;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  },
  
  getOrderById: async (orderId) => {
    try {
      const order = await fetchWithAuth(`/admin/orders/${orderId}`);
      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    return await fetchWithAuth(`/admin/orders/update.php`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, status: status })
    });
  },

  updateOrder: async (orderId, orderData) => {
    try {
      const order = await fetchWithAuth(`/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(orderData)
      });
      return order;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    return await fetchWithAuth(`/admin/orders/delete.php`, {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId })
    });
  },

  getRecentOrders: async (limit = 10) => {
    try {
      const orders = await fetchWithAuth(`/admin/orders/recent?limit=${limit}`);
      return orders;
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return [];
    }
  },

  // Support tickets management
  getSupportTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const query = params.toString();
      const url = query ? `/admin/support-tickets.php?${query}` : '/admin/support-tickets.php';
      
      return await fetchWithAuth(url);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return { tickets: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
    }
  },

  updateSupportTicket: async (ticketId, data) => {
    try {
      return await fetchWithAuth('/admin/support-tickets.php', {
        method: 'PUT',
        body: JSON.stringify({ id: ticketId, ...data })
      });
    } catch (error) {
      console.error('Error updating support ticket:', error);
      throw error;
    }
  },

  deleteSupportTicket: async (ticketId) => {
    try {
      return await fetchWithAuth('/admin/support-tickets.php', {
        method: 'DELETE',
        body: JSON.stringify({ id: ticketId })
      });
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      throw error;
    }
  },

  getSupportStats: async () => {
    try {
      const response = await fetchWithAuth('/admin/support-stats.php');
      return response;
    } catch (error) {
      console.error('Error fetching support stats:', error);
      return { new: 0, urgent: 0, total: 0 };
    }
  },
};