const getApiBase = () => {
  return `${window.location.origin}/api`;
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

const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 Auth request to:', fullUrl);

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    return handleApiResponse(response);

  } catch (error) {
    console.error(`❌ Request error to ${url}:`, error);
    throw error;
  }
};

// Функция для обычных запросов без авторизации
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
  // Auth
  login: (credentials) => 
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

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
      const orders = await fetchWithAuth('/admin/orders');
      return orders;
    } catch (error) {
      console.error('Error in getOrders:', error);
      return [];
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
    try {
      const order = await fetchWithAuth(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return order;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
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
    try {
      await fetchWithAuth(`/admin/orders/${orderId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  getRecentOrders: async (limit = 10) => {
    try {
      const orders = await fetchWithAuth(`/admin/orders/recent?limit=${limit}`);
      return orders;
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return [];
    }
  }
};