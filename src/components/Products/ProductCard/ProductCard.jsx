import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import './ProductCard.css';

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

  return (
    <div className="product-card-wrapper">
      <Card className="product-card">


        {/* Картинка товара */}
        <div className="product-image-container">
          {images && images[0] ? (
            <img 
              src={images[0]} 
              alt={name}
              className="product-image"
              onError={(e) => {
                e.target.style.backgroundColor = '#8767c2';
                e.target.src = 'https://via.placeholder.com/300x200/8767c2/ffffff?text=Нет+изображения';
              }}
            />
          ) : (
            <img 
              src="https://via.placeholder.com/300x200/8767c2/ffffff?text=Нет+изображения" 
              alt="Нет изображения"
              className="product-image"
            />
          )}
        </div>

        {/* Информация о товаре */}
        <div className="product-info">
          <h5 className="product-name">{name}</h5>

          {/* Рейтинг */}
          <div className="product-rating">
            <div className="rating-stars">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index} 
                  size={14}
                  color={index < rating ? '#ffc107' : '#6c757d'} 
                />
              ))}
            </div>
            <span className="rating-count">({reviewsCount})</span>
          </div>

          {/* Цены */}
          <div className="price-container">
            <span className="current-price">
              {price.toLocaleString('ru-RU')} ₽
            </span>
            {oldPrice > price && (
              <div>
                <span className="old-price">
                  {oldPrice.toLocaleString('ru-RU')} ₽
                </span>
                <div className="price-saving">
                  Экономия {((oldPrice - price) / oldPrice * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="product-actions">
            {inStock ? (
              <div className="action-buttons">
                <Button variant="primary" className="btn-cart">
                  <FaShoppingCart className="me-2" />
                  В корзину
                </Button>
                <Button variant="outline-secondary" className="btn-wishlist">
                  <FaHeart className="me-1" />
                  В избранное
                </Button>
              </div>
            ) : (
              <Button variant="outline-secondary" disabled className="btn-out-of-stock">
                Нет в наличии
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductCard;