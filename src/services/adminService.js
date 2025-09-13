const API_BASE = 'http://localhost:5000';

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

    const fullUrl = `${API_BASE}${url}`; // Теперь URL формируется правильно
    
    console.log(`🔄 Making request to: ${fullUrl}`); // Для отладки

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

export const adminService = {
  // Auth
  login: (credentials) => 
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleApiResponse),

  register: (userData) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleApiResponse),

  // Products
  getProducts: async () => {
    return fetchWithAuth('/api/products');
  },

  createProduct: async (productData) => {
    return fetchWithAuth('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        ...productData,
        images: Array.isArray(productData.images) ? productData.images : []
      })
    });
  },

  updateProduct: async (id, productData) => {
    return fetchWithAuth(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return fetchWithAuth(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  getCategories: async () => {
    try {
      console.log('🔄 Fetching categories from server...');
      const data = await fetchWithAuth('/api/categories');
      console.log('✅ Categories received:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to demo data
      return [
        { id: 1, name: 'Бытовая техника', slug: 'appliances', parent_id: null, products_count: 15 },
        { id: 2, name: 'Игровые консоли', slug: 'gaming-consoles', parent_id: null, products_count: 8 },
        { id: 3, name: 'Наушники', slug: 'headphones', parent_id: 1, products_count: 23 },
        { id: 4, name: 'Ноутбуки', slug: 'laptops', parent_id: null, products_count: 34 },
        { id: 5, name: 'Смартфоны', slug: 'smartphones', parent_id: 1, products_count: 45 },
        { id: 6, name: 'Телевизоры', slug: 'tvs', parent_id: 1, products_count: 18 },
        { id: 7, name: 'Фототехника', slug: 'photo-equipment', parent_id: null, products_count: 12 }
      ];
    }
  },

  createCategory: async (categoryData) => {
    return fetchWithAuth('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  updateCategory: async (id, categoryData) => {
    return fetchWithAuth(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (id) => {
    return fetchWithAuth(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Users
  getUsers: async () => {
    return fetchWithAuth('/api/admin/users');
  },

  getDashboardStats: async () => {
    try {
      const data = await fetchWithAuth('/api/admin/stats');
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
  }
};