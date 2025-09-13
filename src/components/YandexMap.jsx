// components/YandexMap.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const YandexMap = ({ center = [51.670550205174614, 36.147750777233355], zoom = 15 }) => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const initMap = () => {
      const { ymaps } = window;
      if (!ymaps || !mapRef.current) return;

      try {
        // Создаем карту
        const map = new ymaps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Кастомная метка
        const placemark = new ymaps.Placemark(
          center,
          {
            balloonContent: `
              <div style="padding: 12px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #1976d2;">Наш магазин</h3>
                <p style="margin: 0 0 8px 0;">
                  <strong>📍 Адрес:</strong><br/>
                  г. Москва, ул. Примерная, д. 123
                </p>
                <p style="margin: 0;">
                  <strong>🕒 Часы работы:</strong><br/>
                  Пн-Пт: 9:00-18:00<br/>
                  Сб-Вс: 10:00-16:00
                </p>
              </div>
            `,
            hintContent: 'Наш магазин - нажмите для информации'
          },
          {
            preset: 'islands#blueShoppingIcon',
            iconColor: '#1976d2'
          }
        );

        map.geoObjects.add(placemark);
        
        // Открываем балун при клике
        placemark.events.add('click', function() {
          placemark.balloon.open();
        });

        setMapInstance(map);
        setIsLoading(false);

      } catch (error) {
        console.error('Ошибка создания карты:', error);
        setIsLoading(false);
      }
    };
      if (window.ymaps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2081de6f-48c5-4a93-aafb-fbd45af2b276&lang=ru_RU';
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          initMap();
        });
      };
      script.onerror = () => {
        console.error('Не удалось загрузить Яндекс Карты');
        setIsLoading(false);
      };
      document.head.appendChild(script); 
      
      return () => {
        if (window.ymaps && mapRef.current) {
          mapRef.current.innerHTML = '';
        }
      };
    }, [center, zoom]);

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