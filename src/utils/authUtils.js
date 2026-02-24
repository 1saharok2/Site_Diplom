// utils/authUtils.js

/**
 * Получить ID текущего пользователя
 * @returns {number} User ID или 0 если не авторизован
 */
export const getUserId = () => {
  try {
    let userId = null;
    
    // 1. Пробуем из localStorage.userId
    userId = localStorage.getItem('userId');
    
    // 2. Если нет или 0, пробуем из userData
    if (!userId || userId === '0' || userId === 'null' || userId === 'undefined') {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.id) {
            userId = userData.id.toString();
            // Сохраняем для будущего быстрого доступа
            localStorage.setItem('userId', userId);
          }
        } catch (parseError) {
          console.error('❌ Error parsing userData:', parseError);
        }
      }
    }
    
    // 3. Конвертируем в число и проверяем
    const numericId = parseInt(userId);
    
    if (isNaN(numericId) || numericId <= 0) {
      return 0;
    }
    
    return numericId;
  } catch (error) {
    console.error('❌ Error in getUserId:', error);
    return 0;
  }
};

export const getUserUuid = () => {
  try {
    // 1. Пробуем из userData.uuid
    const userData = getUserData();
    if (userData?.uuid) return userData.uuid;
    
    // 2. Если нет, пробуем из userData.id (если это строка)
    if (userData?.id && typeof userData.id === 'string') return userData.id;
    
    // 3. Иначе пробуем отдельный ключ localStorage
    const storedUuid = localStorage.getItem('userUuid');
    if (storedUuid) return storedUuid;
    
    // 4. Если ничего нет – возвращаем null
    return null;
  } catch (error) {
    console.error('❌ Error in getUserUuid:', error);
    return null;
  }
};

/**
 * Проверить, авторизован ли пользователь
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken');
    const userId = getUserId();
    
    // Проверяем и токен, и ID
    const authenticated = !!(token && token !== 'null' && token !== 'undefined' && userId > 0);
    
    // Для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Auth check:', {
        hasToken: !!token,
        userId: userId,
        authenticated: authenticated
      });
    }
    
    return authenticated;
  } catch (error) {
    console.error('❌ Error in isAuthenticated:', error);
    return false;
  }
};

/**
 * Получить данные текущего пользователя
 * @returns {Object|null}
 */
export const getUserData = () => {
  try {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return null;
    
    const userData = JSON.parse(userDataStr);
    
    // Проверяем минимальную структуру
    if (!userData || typeof userData !== 'object') {
      return null;
    }
    
    // Добавляем ID из отдельного поля для совместимости
    if (!userData.id && userData.userId) {
      userData.id = userData.userId;
    }
    
    return userData;
  } catch (error) {
    console.error('❌ Error in getUserData:', error);
    // При ошибке парсинга очищаем поврежденные данные
    localStorage.removeItem('userData');
    return null;
  }
};

/**
 * Получить токен авторизации
 * @returns {string|null}
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  } catch (error) {
    console.error('❌ Error in getAuthToken:', error);
    return null;
  }
};

/**
 * Сохранить данные пользователя после авторизации/регистрации
 * @param {Object} data - Данные от сервера {token, user}
 * @returns {boolean} Успешно ли сохранено
 */
export const saveAuthData = (data) => {
  try {
    if (!data || !data.token || !data.user) {
      console.error('❌ Invalid auth data:', data);
      return false;
    }
    
    const { token, user } = data;
    
    // Сохраняем все данные
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    // Гарантированно сохраняем ID
    if (user.id) {
      localStorage.setItem('userId', user.id.toString());
    }
    
    console.log('✅ Auth data saved:', {
      userId: user.id,
      email: user.email,
      hasToken: !!token
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error saving auth data:', error);
    clearAuthData(); // Очищаем при ошибке
    return false;
  }
};

/**
 * Очистить все данные авторизации
 */
export const clearAuthData = () => {
  try {
    const itemsToRemove = [
      'authToken',
      'userId', 
      'userData',
      'user',
      'token'
    ];
    
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

/**
 * Обновить данные пользователя (например, после редактирования профиля)
 * @param {Object} updates - Обновленные данные
 * @returns {Object|null} Обновленные данные или null при ошибке
 */
export const updateUserData = (updates) => {
  try {
    const currentData = getUserData();
    if (!currentData) return null;
    
    const updatedData = { ...currentData, ...updates };
    
    localStorage.setItem('userData', JSON.stringify(updatedData));
    
    // Обновляем ID если изменился
    if (updates.id) {
      localStorage.setItem('userId', updates.id.toString());
    }
    
    console.log('✅ User data updated');
    return updatedData;
  } catch (error) {
    console.error('❌ Error updating user data:', error);
    return null;
  }
};

/**
 * Проверить роль пользователя
 * @param {string} role - Роль для проверки
 * @returns {boolean}
 */
export const hasRole = (role) => {
  try {
    const userData = getUserData();
    if (!userData || !userData.role) return false;
    
    return userData.role === role;
  } catch (error) {
    console.error('❌ Error in hasRole:', error);
    return false;
  }
};

/**
 * Проверить, является ли пользователь администратором
 * @returns {boolean}
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Проверить, является ли пользователь обычным клиентом
 * @returns {boolean}
 */
export const isCustomer = () => {
  return hasRole('customer');
};

/**
 * Получить заголовки для API запросов
 * @param {Object} additionalHeaders - Дополнительные заголовки
 * @returns {Object} Заголовки для fetch
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Создать URL с параметром userId для API запросов
 * @param {string} baseUrl - Базовый URL
 * @param {Object} params - Дополнительные параметры
 * @returns {string}
 */
export const buildUrlWithUserId = (baseUrl, params = {}) => {
  try {
    const url = new URL(baseUrl, window.location.origin);
    const userId = getUserId();
    
    // Добавляем userId только если пользователь авторизован
    if (userId > 0) {
      url.searchParams.set('userId', userId);
    }
    
    // Добавляем дополнительные параметры
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  } catch (error) {
    console.error('❌ Error building URL:', error);
    return baseUrl;
  }
};

/**
 * Обертка для fetch с авторизацией
 * @param {string} url 
 * @param {Object} options 
 * @returns {Promise}
 */
export const fetchWithAuth = async (url, options = {}) => {
  const headers = getAuthHeaders(options.headers);
  
  const config = {
    ...options,
    headers
  };
  
  // Добавляем credentials для кук если нужно
  if (process.env.REACT_APP_API_URL?.includes('electronic.tw1.ru')) {
    config.credentials = 'include';
  }
  
  try {
    console.log('🔧 Fetch with auth:', { url, method: config.method || 'GET' });
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

/**
 * Хук для отслеживания состояния авторизации
 * (для использования в React компонентах)
 */
export const useAuthStatus = () => {
  // Это функция, а не React хук, но может быть обернута
  return {
    isAuthenticated: isAuthenticated(),
    userId: getUserId(),
    userData: getUserData(),
    isAdmin: isAdmin(),
    isCustomer: isCustomer()
  };
};

/**
 * Проверить и синхронизировать данные авторизации
 * Используется при загрузке приложения
 */
export const checkAndSyncAuth = () => {
  try {
    const token = getAuthToken();
    const userId = getUserId();
    const userData = getUserData();
    
    // Проверяем целостность данных
    const isValid = !!(token && userId > 0 && userData);
    
    if (!isValid) {
      console.warn('⚠ Auth data integrity check failed, clearing...');
      clearAuthData();
      return false;
    }
    
    // Проверяем, что ID в userData совпадает с userId
    if (userData.id && userData.id.toString() !== userId.toString()) {
      console.warn('⚠ User ID mismatch, fixing...');
      localStorage.setItem('userId', userData.id.toString());
    }
    
    console.log('✅ Auth check passed:', { userId, email: userData.email });
    return true;
  } catch (error) {
    console.error('❌ Auth check error:', error);
    clearAuthData();
    return false;
  }
};

/**
 * Экспортируем все утилиты как объект для удобного импорта
 */
const authUtils = {
  getUserId,
  isAuthenticated,
  getUserData,
  getAuthToken,
  saveAuthData,
  clearAuthData,
  updateUserData,
  hasRole,
  isAdmin,
  isCustomer,
  getAuthHeaders,
  buildUrlWithUserId,
  fetchWithAuth,
  useAuthStatus,
  checkAndSyncAuth
};

export default authUtils;