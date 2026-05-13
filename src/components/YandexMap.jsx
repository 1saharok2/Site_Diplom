import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/** Один и тот же массив по ссылке — иначе при каждом рендере родителя «новый» default center ломает useCallback и пересоздаёт карту. */
const DEFAULT_MAP_CENTER = Object.freeze([51.670550205174614, 36.147750777233355]);

const YandexMap = ({ center = DEFAULT_MAP_CENTER, zoom = 15 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Подавление ошибок Яндекс Карт
  useEffect(() => {
    const originalError = console.error;
    
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('yandex.ru/clck') || 
           args[0].includes('ERR_BLOCKED_BY_ADBLOCKER') ||
           args[0].includes('counter'))) {
        return; // Игнорируем ошибки трекинга
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const initMapSimple = useCallback(() => {
    // Проверяем что ymaps полностью загружен и содержит Map
    if (!window.ymaps || typeof window.ymaps.Map !== 'function') {
      console.error('Yandex Maps API не загружен полностью');
      setIsLoading(false);
      return;
    }

    if (!mapRef.current) return;

    try {
      // Уничтожаем предыдущую карту если есть
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.log('Ошибка при уничтожении карты:', e);
        }
      }

      // Создаем новую карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Создаем метку
      const placemark = new window.ymaps.Placemark(
        center,
        {
          hintContent: 'Наш магазин - нажмите для информации',
          balloonContent: `
            <div style="padding: 12px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #d64e2cb6;">Магазин электроники</h3>
              <p style="margin: 0 0 8px 0;">
                <strong>📍 Адрес:</strong><br/>
                г. Курск, ул. Белгородская, д. 14
              </p>
              <p style="margin: 0;">
                <strong>🕒 Часы работы:</strong><br/>
                Пн-Пт: 9:00-18:00<br/>
                Сб-Вс: 10:00-16:00
              </p>
            </div>
          `
        },
        {
          preset: 'islands#blueShoppingIcon',
          iconColor: '#1976d2'
        }
      );

      // Добавляем метку на карту
      map.geoObjects.add(placemark);

      mapInstanceRef.current = map;
      setIsLoading(false);

    } catch (error) {
      console.error('Ошибка создания карты:', error);
      setIsLoading(false);
      
      // Пробуем еще раз
      setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 1000);
    }
  }, [center, zoom]);

  useEffect(() => {
    // Функция для загрузки карт
    const loadYandexMaps = () => {
      // Если уже загружено
      if (window.ymaps && typeof window.ymaps.Map === 'function') {
        initMapSimple();
        return true;
      }

      // Если скрипт уже загружается
      if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
        // Ждем загрузки
        const checkInterval = setInterval(() => {
          if (window.ymaps && typeof window.ymaps.Map === 'function') {
            clearInterval(checkInterval);
            initMapSimple();
          }
        }, 100);
        
        return false;
      }

      // Загружаем скрипт
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2081de6f-48c5-4a93-aafb-fbd45af2b276&lang=ru_RU';
      script.async = true;
      
      script.onload = () => {
        // Ждем пока ymaps.ready будет доступен
        const readyInterval = setInterval(() => {
          if (window.ymaps && window.ymaps.ready) {
            clearInterval(readyInterval);
            window.ymaps.ready(() => {
              initMapSimple();
            });
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.log('Ошибка загрузки Яндекс Карт');
        setIsLoading(false);
        setLoadAttempt(prev => prev + 1);
      };
      
      document.head.appendChild(script);
      return false;
    };

    // Пытаемся загрузить
    const loaded = loadYandexMaps();
    
    // Если не загрузилось сразу, пробуем еще раз
    if (!loaded && loadAttempt < 3) {
      const retryTimer = setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }

    return () => {
      // Очистка
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.log('Ошибка при очистке карты:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [initMapSimple, loadAttempt]);

  // Статичная карта как fallback
  const showStaticMap = () => (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '300px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        flexDirection: 'column',
        p: 3
      }}
    >
      <Typography variant="h6" gutterBottom>
        🗺️ Магазин "Магазин электроники"
      </Typography>
      <Typography variant="body2">
        г. Курск, ул. Белгородская, д. 14
      </Typography>
      <Typography variant="body2">
        📞 +7 (999) 123-45-67
      </Typography>
      <Typography variant="caption" sx={{ mt: 2, opacity: 0.8 }}>
        Пн-Пт: 9:00-18:00, Сб-Вс: 10:00-16:00
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            borderRadius: '8px',
            zIndex: 2
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Загрузка карты...
          </Typography>
        </Box>
      )}
      
      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '300px',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          zIndex: 1
        }}
      />
      
      {/* Показываем статичную карту если динамическая не загрузилась */}
      {!isLoading && !mapInstanceRef.current && showStaticMap()}
    </Box>
  );
};

export default memo(YandexMap);