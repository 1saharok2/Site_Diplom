// src/utils/authSync.js

/**
 * Проверить синхронизацию данных авторизации
 */
export const checkAuthSync = () => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const userDataStr = localStorage.getItem('userData');
  
  console.log('🔍 Проверка синхронизации auth:', {
    token: token ? 'да' : 'нет',
    userId: userId,
    userData: userDataStr ? 'да' : 'нет'
  });
  
  // Если есть токен, но нет userId или userData - проблема
  if (token && (!userId || userId === '0' || !userDataStr)) {
    console.warn('⚠ Несогласованные данные авторизации');
    return false;
  }
  
  return true;
};

/**
 * Восстановить userId из userData если нужно
 */
export const restoreUserId = () => {
  try {
    const userId = localStorage.getItem('userId');
    const userDataStr = localStorage.getItem('userData');
    
    // Если userId=0 или отсутствует, но есть userData
    if ((!userId || userId === '0') && userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData && userData.id) {
        console.log('🔧 Восстанавливаем userId из userData:', userData.id);
        localStorage.setItem('userId', userData.id.toString());
        return userData.id;
      }
    }
    
    return userId ? parseInt(userId) : 0;
  } catch (error) {
    console.error('❌ Error restoring userId:', error);
    return 0;
  }
};

/**
 * Инициализировать авторизацию при загрузке страницы
 */
export const initAuth = () => {
  const userId = restoreUserId();
  const isSynced = checkAuthSync();
  
  console.log('🚀 Auth initialized:', {
    userId: userId,
    isSynced: isSynced,
    isAuthenticated: userId > 0
  });
  
  return {
    userId: userId,
    isAuthenticated: userId > 0,
    isSynced: isSynced
  };
};