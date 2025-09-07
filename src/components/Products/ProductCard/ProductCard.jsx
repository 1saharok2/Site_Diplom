import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const {
    name,
    price,
    oldPrice,
    images,
    rating,
    reviewsCount,
    isNew,
    discount,
    inStock
  } = product;

  // СЕРЬЕЗНАЯ ДИАГНОСТИКА
  console.log('=== PRODUCT CARD DEBUG ===');
  console.log('Product:', product.name);
  console.log('Images array:', images);
  console.log('First image:', images[0]);
  console.log('Image type:', typeof images[0]);
  console.log('======================');

  return (
    <Card className="h-100" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Бейджи */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
        {isNew && <Badge bg="success" className="me-1">Новинка</Badge>}
        {discount > 0 && <Badge bg="danger">-{discount}%</Badge>}
      </div>

      {/* Картинка товара с усиленной диагностикой */}
      <div style={{ 
        height: '250px', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed red' // Добавим рамку для видимости
      }}>
        {images && images[0] ? (
          <img 
            src={images[0]} 
            alt={name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              padding: '20px'
            }}
            onError={(e) => {
              console.error('🛑 IMAGE LOAD ERROR:', images[0]);
              console.error('Error event:', e);
              e.target.style.backgroundColor = '#ffcccc';
              e.target.innerHTML = '❌ Ошибка загрузки';
            }}
            onLoad={(e) => {
              console.log('✅ Image loaded successfully:', images[0]);
            }}
          />
        ) : (
          <div style={{ 
            color: '#6c757d', 
            textAlign: 'center',
            padding: '20px'
          }}>
            <div>🖼️ Нет изображения</div>
            <small>Path: {images && images[0] ? images[0] : 'undefined'}</small>
          </div>
        )}
      </div>

      {/* Остальной код без изменений */}
      <Card.Body className="d-flex flex-column">
        <Card.Title style={{ fontSize: '1rem', height: '48px', overflow: 'hidden' }}>
          {name}
        </Card.Title>

        <div className="d-flex align-items-center mb-2">
          <div className="d-flex">
            {[...Array(5)].map((_, index) => (
              <FaStar 
                key={index} 
                style={{ 
                  color: index < rating ? '#ffc107' : '#6c757d',
                  marginRight: '2px',
                  fontSize: '14px'
                }} 
              />
            ))}
          </div>
          <small className="text-muted ms-1">({reviewsCount})</small>
        </div>

        <div className="mb-3">
          <span className="fs-5 fw-bold text-primary">
            {price.toLocaleString('ru-RU')} ₽
          </span>
          {oldPrice > price && (
            <div>
              <span className="text-muted text-decoration-line-through">
                {oldPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {inStock ? (
            <div className="d-grid gap-2">
              <Button variant="primary" size="sm">
                <FaShoppingCart className="me-2" />
                В корзину
              </Button>
              <Button variant="outline-secondary" size="sm">
                <FaHeart className="me-1" />
                В избранное
              </Button>
            </div>
          ) : (
            <Button variant="outline-secondary" disabled className="w-100">
              Нет в наличии
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;