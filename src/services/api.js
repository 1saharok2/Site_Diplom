const getApiBase = () => {
  // Если есть переменная окружения — используем её
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Локальная разработка
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  // Продакшн (на сервере)
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_BASE = getApiBase();

console.log('🔧 API_BASE:', API_BASE);

// Улучшенная обработка ответов
const handleResponse = async (response, url) => {
  try {
    // Получаем текст ответа для отладки
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error(`❌ JSON parse error for ${url}:`, parseError);
      console.error('Response text:', responseText);
      throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
    }
    
    // Логируем для отладки
    console.log(`📥 Response from ${url}:`, {
      status: response.status,
      ok: response.ok,
      data: data
    });
    
    // Если ответ не OK, бросаем ошибку
    if (!response.ok) {
      const errorMessage = data.message || 
                          data.error || 
                          `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error in handleResponse for ${url}:`, error);
    throw error;
  }
};

// Обертка для fetch с добавлением токена
const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Добавляем токен если есть
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Для некоторых API добавляем userId в параметры или заголовки
  const fullUrl = new URL(url, window.location.origin);
  if (userId && userId !== '0') {
    // Добавляем userId к существующим query параметрам
    fullUrl.searchParams.append('userId', userId);
  }
  
  return fetch(fullUrl.toString(), {
    ...options,
    headers
  });
};

export const apiService = {
  // Базовые методы с авторизацией
  get: (url) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 GET request to:', fullUrl);
    return fetchWithAuth(fullUrl).then(response => handleResponse(response, fullUrl));
  },
  
  post: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 POST request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => handleResponse(response, fullUrl));
  },
    
  put: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 PUT request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(response => handleResponse(response, fullUrl));
  },
    
  delete: (url, data = {}) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 DELETE request to:', fullUrl, data);
    return fetchWithAuth(fullUrl, {
      method: 'DELETE',
      body: Object.keys(data).length > 0 ? JSON.stringify(data) : undefined
    }).then(response => handleResponse(response, fullUrl));
  },
  
  // Products - используйте только эти методы
  getProducts: () => {
    const url = `/products`;
    console.log('🔧 getProducts URL:', url);
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
    console.log('🔧 getCategories URL:', url);
    return apiService.get(url);
  },
  
  getCategory: (slug) => {
    return apiService.get(`/categories/${slug}`);
  },

  // Auth - исправленные методы
  login: async (credentials) => {
    try {
      const url = `${API_BASE}/auth/login`;
      console.log('🔧 login URL:', url);
      console.log('🔧 login credentials:', { ...credentials, password: '***' });
      
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
        console.log('✅ Login successful, user ID:', data.user.id);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // Используйте правильный URL - ваш файл register.php
      const url = 'https://electronic.tw1.ru/api/register.php';
      console.log('🔧 register URL:', url);
      console.log('🔧 register data:', { 
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

      console.log('🔧 register response status:', response.status);
      
      const data = await response.json();
      console.log('🔧 register response data:', data);

      // !!! ИСПРАВЛЕНИЕ: ваш API не возвращает поле success
      // Проверяем структуру ответа (ваш API возвращает другой формат)
      if (!data.token || !data.user) {
        console.error('⚠ Неожиданная структура ответа:', data);
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
      
      console.log('✅ Registration successful:', {
        userId: normalizedData.user.id,
        email: normalizedData.user.email,
        tokenSaved: !!normalizedData.token
      });
      
      return normalizedData;
      
    } catch (error) {
      console.error('❌ API register error:', error);
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
    console.log('✅ Logged out successfully');
  },

  // Cart & Orders
  createOrder: (orderData) => {
    return apiService.post('/orders', orderData);
  },

  getUserOrders: async (userId = null) => {
    try {
      const actualUserId = userId || localStorage.getItem('userId') || 0;
      
      // Если userId=0, возвращаем пустые данные
      if (!actualUserId || actualUserId === '0') {
        console.log('⚠ No valid user ID, returning empty orders');
        return {
          success: true,
          orders: [],
          count: 0
        };
      }
      
      const response = await apiService.get(`/orders/user/${actualUserId}`);
      return response;
    } catch (error) {
      console.error('Error getting user orders:', error);
      // В случае ошибки возвращаем пустой массив
      return {
        success: false,
        orders: [],
        count: 0,
        message: error.message
      };
    }
  },

  // Product Variants
  getProductVariants: (baseName) => {
    const encodedBaseName = encodeURIComponent(baseName);
    return apiService.get(`/products/variants/${encodedBaseName}`);
  },

  // Reviews
  getUserReviews: async (userId = null) => {
    try {
      const actualUserId = userId || localStorage.getItem('userId') || 0;
      
      // Если userId=0, возвращаем пустые данные
      if (!actualUserId || actualUserId === '0') {
        console.log('⚠ No valid user ID, returning empty reviews');
        return {
          success: true,
          reviews: [],
          count: 0
        };
      }
      
      const response = await apiService.get(`/reviews/user/${actualUserId}`);
      return response;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      // В случае ошибки возвращаем пустой массив
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
    const actualUserId = userId || localStorage.getItem('userId');
    if (!actualUserId || actualUserId === '0') {
      console.log('⚠ No user ID, returning empty cart');
      return Promise.resolve({ success: true, items: [] });
    }
    return apiService.get(`/cart.php?userId=${actualUserId}`);
  },

  // Wishlist specific methods
  getWishlist: (userId = null) => {
    const actualUserId = userId || localStorage.getItem('userId');
    if (!actualUserId || actualUserId === '0') {
      console.log('⚠ No user ID, returning empty wishlist');
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
      console.error('Auth check error:', error);
      return { authenticated: false };
    }
  },

  // Получить текущего пользователя
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};