import { getUserId } from "../utils/authUtils";
import { IS_DEV, devLog } from "../utils/devLog";

const getApiBase = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `https://electronic.tw1.ru/api`; 
};

const API_BASE = getApiBase();

devLog('🔧 API_BASE:', API_BASE);

// Улучшенная обработка ответов
const handleResponse = async (response, url) => {
  try {
    // Получаем текст ответа для отладки
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      if (IS_DEV) {
        console.error(`❌ JSON parse error for ${url}:`, parseError);
        console.error('Response text:', responseText);
      }
      throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
    }
    
    if (IS_DEV) {
      devLog(`📥 Response from ${url}:`, {
        status: response.status,
        ok: response.ok,
        data
      });
    }
    
    // Если ответ не OK, бросаем ошибку
    if (!response.ok) {
      const errorMessage = data.message || 
                          data.error || 
                          `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (IS_DEV) console.error(`❌ Error in handleResponse for ${url}:`, error);
    throw error;
  }
};

// Обертка для fetch с добавлением токена
const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ❌ НИКАКОГО userId здесь
  return fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, {
    ...options,
    headers
  });
};

export const apiService = {
  // Базовые методы с авторизацией
  get: (url) => {
    const fullUrl = `${API_BASE}${url}`;
    devLog('🔧 GET request to:', fullUrl);
    return fetchWithAuth(fullUrl).then(response => handleResponse(response, fullUrl));
  },
  
  post: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    devLog('🔧 POST request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => handleResponse(response, fullUrl));
  },
    
  put: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    devLog('🔧 PUT request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(response => handleResponse(response, fullUrl));
  },
    
  delete: (url, data = {}) => {
    const fullUrl = `${API_BASE}${url}`;
    devLog('🔧 DELETE request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'DELETE',
      body: Object.keys(data).length > 0 ? JSON.stringify(data) : undefined
    }).then(response => handleResponse(response, fullUrl));
  },

  /** Загрузка аватара (multipart), токен как у остальных запросов */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token =
      localStorage.getItem('token') || localStorage.getItem('authToken');
    const fullUrl = `${API_BASE}/auth/upload_avatar.php`;
    devLog('🔧 uploadAvatar:', fullUrl);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return handleResponse(response, fullUrl);
  },

  /** Обращения в поддержку текущего пользователя (ответы администратора) */
  getMySupportTickets: async () => {
    const token =
      localStorage.getItem('token') || localStorage.getItem('authToken');
    const fullUrl = `${API_BASE}/support/my-tickets.php`;
    devLog('🔧 getMySupportTickets:', fullUrl);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return handleResponse(response, fullUrl);
  },
  
  // Products - используйте только эти методы
  getProducts: () => {
    const url = `/products`;
    devLog('🔧 getProducts URL:', url);
    return apiService.get(url);
  },
  
  getProduct: (id) => {
    return apiService.get(`/products/${id}`);
  },
  
  getProductsByCategory: (categorySlug) => {
    return apiService.get(`/products/category/${categorySlug}`);
  },
    
  searchProducts: (query) => {
    return apiService.get(`/products/search?q=${encodeURIComponent(query)}`);
  },
  
  // Categories
  getCategories: () => {
    const url = `/categories`;
    devLog('🔧 getCategories URL:', url);
    return apiService.get(url);
  },
  
  getCategory: (slug) => {
    return apiService.get(`/categories/${slug}`);
  },

  getCategoryFilters: (categorySlug) => {
    const url = `/filters.php?category=${categorySlug}`;
    devLog('🔧 getCategoryFilters URL:', url);
    return apiService.get(url);
  },

  // Auth - исправленные методы
  login: async (credentials) => {
    try {
      const url = `${API_BASE}/auth/login`;
      devLog('🔧 login URL:', url);
      devLog('🔧 login credentials:', { ...credentials, password: '***' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await handleResponse(response, url);
      
      // Сохраняем данные пользователя
      if (data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id.toString());
        localStorage.setItem('userData', JSON.stringify(data.user));
        devLog('✅ Login successful, user ID:', data.user.id);
      }
      
      return data;
    } catch (error) {
      if (IS_DEV) console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const url = 'https://electronic.tw1.ru/api/auth/register.php';
      devLog('🔧 register URL:', url);
      devLog('🔧 register data:', { 
        ...userData, 
        password: userData.password ? '***' : undefined 
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      devLog('🔧 register response status:', response.status);
      
      const data = await response.json();
      devLog('🔧 register response data:', data);

      // !!! ИСПРАВЛЕНИЕ: ваш API не возвращает поле success
      // Проверяем структуру ответа (ваш API возвращает другой формат)
      if (!data.token || !data.user) {
        if (IS_DEV) console.error('⚠ Неожиданная структура ответа:', data);
        throw new Error(data.message || 'Сервер вернул некорректные данные');
      }

      // ✅ Добавляем success: true для совместимости
      const normalizedData = {
        success: true,
        message: data.message || 'User created successfully',
        token: data.token,
        user: data.user
      };

      // ✅ Сохраняем данные правильно
      localStorage.setItem('authToken', normalizedData.token);
      localStorage.setItem('userId', normalizedData.user.id.toString());
      localStorage.setItem('userData', JSON.stringify(normalizedData.user));
      
      devLog('✅ Registration successful:', {
        userId: normalizedData.user.id,
        email: normalizedData.user.email,
        tokenSaved: !!normalizedData.token
      });
      
      return normalizedData;
      
    } catch (error) {
      if (IS_DEV) console.error('❌ API register error:', error);
      // Очищаем при ошибке
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    devLog('✅ Logged out successfully');
  },

  // Cart & Orders
  createOrder: async (orderData) => {
    const url = `/orders.php`;
    devLog('🔧 createOrder URL:', url, orderData);
    
    try {
      const response = await fetchWithAuth(`${API_BASE}${url}`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      const result = await handleResponse(response, url);
      devLog('✅ Order created successfully:', result);
      return result;
      
    } catch (error) {
      if (IS_DEV) console.error('❌ Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  },

  getUserOrders: async (userId) => {
    const url = `/orders/user/${userId}`;
    devLog('🔧 getUserOrders URL:', url);
    
    try {
      const response = await fetchWithAuth(`${API_BASE}${url}`);
      const result = await handleResponse(response, url);
      devLog('✅ User orders fetched:', result.orders?.length || 0, 'orders');
      return result;
      
    } catch (error) {
      if (IS_DEV) console.error('❌ Error fetching user orders:', error);
      // Возвращаем пустые данные вместо ошибки
      return {
        success: true,
        orders: [],
        count: 0
      };
    }
  },

  getOrderById: async (orderId) => {
    const url = `/orders/${orderId}`;
    devLog('🔧 getOrderById URL:', url);
    
    try {
      const response = await fetchWithAuth(`${API_BASE}${url}`);
      return await handleResponse(response, url);
      
    } catch (error) {
      if (IS_DEV) console.error('❌ Error fetching order:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const url = `/admin/orders/${orderId}/status`;
    devLog('🔧 updateOrderStatus URL:', url);
    
    try {
      const response = await fetchWithAuth(`${API_BASE}${url}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      
      return await handleResponse(response, url);
      
    } catch (error) {
      if (IS_DEV) console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  // Product Variants
  getProductVariants: (baseName) => {
    const encodedBaseName = encodeURIComponent(baseName);
    return apiService.get(`/products/variants/${encodedBaseName}`);
  },

  // Reviews
  getUserReviews: async (userId = null) => {
    devLog('getUserReviews called');
    try {
      const actualUserId = userId || localStorage.getItem('userId');
      
      if (!actualUserId || actualUserId === '0') {
        return { success: true, reviews: [], count: 0 };
      }
      
      // МЕНЯЕМ ПУТЬ на прямой вызов файла с параметром
      const url = `reviews.php?user_id=${actualUserId}`;
      devLog('🔧 getUserReviews URL:', url);
      
      return await apiService.get(url);
    } catch (error) {
      if (IS_DEV) console.error('❌ Error getting user reviews:', error);
      return {
        success: false,
        reviews: [],
        count: 0,
        message: error.message
      };
    }
  },

  // Cart specific methods (для обратной совместимости)
  getCart: (userId = null) => {
      try {
          const actualUserId = userId || localStorage.getItem('userId');
          if (!actualUserId || actualUserId === '0') {
              devLog('⚠ No user ID, returning empty cart');
              return Promise.resolve({ success: true, items: [] });
          }
          
          // Убедитесь, что userId не дублируется
          const url = `/cart.php?userId=${actualUserId}`;
          devLog('🔧 getCart URL:', url);
          
          // Используйте простой fetch без fetchWithAuth
          return fetch(`${API_BASE}${url}`)
              .then(response => handleResponse(response, url))
              .catch(error => {
                  if (IS_DEV) console.error('Cart fetch error:', error);
                  return { success: true, items: [] };
              });
      } catch (error) {
          if (IS_DEV) console.error('Error in getCart:', error);
          return Promise.resolve({ success: true, items: [] });
      }
  },

  // Wishlist specific methods
  getWishlist: (userId = null) => {
    const actualUserId = userId || localStorage.getItem('userId');
    if (!actualUserId || actualUserId === '0') {
      devLog('⚠ No user ID, returning empty wishlist');
      return Promise.resolve({ success: true, items: [] });
    }
    return apiService.get(`/wishlist.php?userId=${actualUserId}`);
  },

  // Проверка токена
  checkAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { authenticated: false };
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return { authenticated: true };
      } else {
        // Токен невалидный, очищаем
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        return { authenticated: false };
      }
    } catch (error) {
      if (IS_DEV) console.error('Auth check error:', error);
      return { authenticated: false };
    }
  },

  // Получить текущего пользователя
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      if (IS_DEV) console.error('Error getting current user:', error);
      return null;
    }
  }
};