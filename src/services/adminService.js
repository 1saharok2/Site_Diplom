import {supabase} from '../services/supabaseClient'

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
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return products.map(product => ({
      ...product,
      images: product.image_url ? [product.image_url] : [],
      mainImage: product.image_url || ''
    }));
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
    }
  },

  createProduct: async (productData) => {
  try {
    const image_url = productData.images && productData.images.length > 0 
      ? productData.images[0] 
      : null;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category_slug: productData.category_slug,
        brand: productData.brand,
        stock: productData.stock,
        image_url: image_url
      })
      .select()
      .single();

    if (error) throw error;
    return product;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
},

  updateProduct: async (id, productData) => {
  try {
    const image_url = productData.images && productData.images.length > 0 
      ? productData.images[0] 
      : null;

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category_slug: productData.category_slug,
        brand: productData.brand,
        stock: productData.stock,
        image_url: image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return product;
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
},

deleteProduct: async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
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
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateCategory: async (id, categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
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

  updateUser: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteUser: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
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