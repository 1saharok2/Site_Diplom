// components/YandexMap.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const YandexMap = ({ center = [51.670550205174614, 36.147750777233355], zoom = 15 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const initMapSimple = useCallback(() => {
    const { ymaps } = window;
    if (!ymaps || !mapRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

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

      // Надежный способ: создаем новый балун при каждом клике
      placemark.events.add('click', function(e) {
        e.preventDefault();
        
        // Закрываем текущий балун
        map.balloon.close();
        
        // Создаем новый балун карты (не метки)
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
    if (window.ymaps) {
      window.ymaps.ready(initMapSimple);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2081de6f-48c5-4a93-aafb-fbd45af2b276&lang=ru_RU';
    script.async = true;
    
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(initMapSimple);
      }
    };
    
    script.onerror = () => {
      console.error('Не удалось загрузить Яндекс Карты');
      setIsLoading(false);
    };
    
    document.head.appendChild(script); 
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [initMapSimple]);

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
            zIndex: 1
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
          transition: 'opacity 0.3s ease'
        }}
      />
    </Box>
  );
};

export default YandexMap;