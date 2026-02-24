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
    
    // Если userId отсутствует или равен '0', но есть userData
    if ((!userId || userId === '0') && userDataStr) {
      const userData = JSON.parse(userDataStr);
      // Пытаемся получить uuid (строку) или id (число, но лучше uuid)
      if (userData && userData.uuid) {
        console.log('🔧 Восстанавливаем userId из userData.uuid:', userData.uuid);
        localStorage.setItem('userId', userData.uuid);
        return userData.uuid;
      } else if (userData && userData.id) {
        // Если есть только числовой id, преобразуем в строку
        console.log('🔧 Восстанавливаем userId из userData.id:', userData.id);
        localStorage.setItem('userId', userData.id.toString());
        return userData.id.toString();
      }
    }
    
    // Возвращаем userId как есть (строка или null)
    return userId || null;
  } catch (error) {
    console.error('❌ Error restoring userId:', error);
    return null;
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
    isAuthenticated: !!userId && userId !== '0'
  });
  
  return {
    userId: userId,
    isAuthenticated: !!userId && userId !== '0',
    isSynced: isSynced
  };
};