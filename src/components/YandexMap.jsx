import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Глобальная переменная для отслеживания инициализации
let yandexMapsLoaded = false;

const YandexMap = ({ center = [51.670550205174614, 36.147750777233355], zoom = 15 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const initMapSimple = useCallback(() => {
    const { ymaps } = window;
    if (!ymaps || !mapRef.current) return;

    try {
      // Уничтожаем предыдущую карту если есть
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.log('Ошибка при уничтожении карты:', e);
        }
        mapInstanceRef.current = null;
      }

      // Создаем новую карту
      const map = new ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl']
      });

      const placemark = new ymaps.Placemark(
        center,
        {
          hintContent: 'Наш магазин - нажмите для информации'
        },
        {
          preset: 'islands#blueShoppingIcon',
          iconColor: '#1976d2'
        }
      );

      map.geoObjects.add(placemark);

      // Обработчик клика на метке
      placemark.events.add('click', function(e) {
        e.preventDefault();
        
        map.balloon.close();
        
        map.balloon.open(e.get('coords'), {
          content: `
            <div style="padding: 12px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #d64e2cb6;">Электроник</h3>
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
          `,
          closeButton: true
        });
      });

      // Закрываем балун при клике на карту
      map.events.add('click', function(e) {
        if (!e.get('target')) {
          map.balloon.close();
        }
      });

      mapInstanceRef.current = map;
      setIsLoading(false);

    } catch (error) {
      console.error('Ошибка создания карты:', error);
      setIsLoading(false);
    }
  }, [center, zoom]);

  useEffect(() => {
    // Если карта уже загружена глобально
    if (window.ymaps && yandexMapsLoaded) {
      initMapSimple();
      return;
    }

    // Если скрипт уже загружается или загружен
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      // Ждем пока загрузится
      const checkYmaps = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkYmaps);
          yandexMapsLoaded = true;
          initMapSimple();
        }
      }, 100);
      
      return () => clearInterval(checkYmaps);
    }

    // Загружаем скрипт
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2081de6f-48c5-4a93-aafb-fbd45af2b276&lang=ru_RU&load=package.full';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      yandexMapsLoaded = true;
      if (window.ymaps) {
        window.ymaps.ready(initMapSimple);
      }
    };
    
    script.onerror = () => {
      console.error('Не удалось загрузить Яндекс Карты');
      setIsLoading(false);
      
      // Пробуем еще раз через 2 секунды
      setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 2000);
    };
    
    document.head.appendChild(script); 
    
    return () => {
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

  // Альтернативный вариант если карта не загружается
  const showStaticMap = () => {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '300px',
          backgroundImage: `url(https://static-maps.yandex.ru/v1?ll=${center[1]},${center[0]}&z=${zoom}&size=600,300&apikey=2081de6f-48c5-4a93-aafb-fbd45af2b276)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          backgroundColor: 'grey.200'
        }}
      >
        <Typography variant="h6">
          Карта магазина<br/>
          г. Курск, ул. Белгородская, д. 14
        </Typography>
      </Box>
    );
  };

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
      
      {loadAttempt > 2 ? (
        // Показываем статичную карту после нескольких неудачных попыток
        showStaticMap()
      ) : (
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
      )}
    </Box>
  );
};

export default YandexMap;