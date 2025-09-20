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

    const fullUrl = `${API_BASE}${url}`;    

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
      const data = await fetchWithAuth('/api/categories');
      return data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to demo data
      return;
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
  },

  getOrders: async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (*)
          ),
          users (email, first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Форматируем данные для удобства использования
      return orders.map(order => ({
        ...order,
        user_email: order.users?.email,
        user_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
        user_phone: order.users?.phone,
        items_count: order.order_items?.length || 0
      }));
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  },
  
  getOrderById: async (orderId) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (*)
          ),
          users (email, first_name, last_name, phone, avatar_url),
          stores (name, address, phone),
          employees (first_name, last_name, position)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return order;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  },

  updateOrder: async (orderId, orderData) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email,
          total_amount: orderData.total_amount,
          status: orderData.status,
          store_id: orderData.store_id,
          employee_id: orderData.employee_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return order;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  assignEmployeeToOrder: async (orderId, employeeId) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          employee_id: employeeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return order;
    } catch (error) {
      console.error('Error in assignEmployeeToOrder:', error);
      throw error;
    }
  },

  getOrdersByStatus: async (status) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          users (email, first_name, last_name)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orders;
    } catch (error) {
      console.error('Error in getOrdersByStatus:', error);
      throw error;
    }
  },

  getRecentOrders: async (limit = 10) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          users (email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return orders;
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      throw error;
    }
  },

  // Статистика по заказам
  getOrdersStats: async () => {
    try {
      // Получаем общее количество заказов
      const { count: totalOrders, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      if (countError) throw countError;

      // Получаем заказы по статусам
      const { data: ordersByStatus, error: statusError } = await supabase
        .from('orders')
        .select('status')
        .then(result => {
          const statusCounts = {};
          result.data?.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
          });
          return { data: statusCounts, error: null };
        });

      if (statusError) throw statusError;

      // Получаем общую сумму продаж
      const { data: totalSalesData, error: salesError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      if (salesError) throw salesError;

      const totalSales = totalSalesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return {
        total_orders: totalOrders || 0,
        status_counts: ordersByStatus || {},
        total_sales: totalSales,
        average_order_value: totalOrders > 0 ? totalSales / totalOrders : 0
      };
    } catch (error) {
      console.error('Error in getOrdersStats:', error);
      throw error;
    }
  }  
};