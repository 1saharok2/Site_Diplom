import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import './ProductCard.css'; // Стили (опционально)

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    price,
    oldPrice,
    image,
    category,
    rating,
    reviewsCount,
    isNew,
    discount,
    inStock
  } = product;

  return (
    <Card className="product-card h-100">
      {/* Бейджи: новинка, скидка */}
      <div className="product-badges">
        {isNew && (
          <Badge bg="success" className="product-badge">
            Новинка
          </Badge>
        )}
        {discount > 0 && (
          <Badge bg="danger" className="product-badge">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* Изображение товара */}
      <Card.Img 
        variant="top" 
        src={image} 
        alt={name}
        className="product-image"
      />

      <Card.Body className="d-flex flex-column">
        {/* Категория */}
        <small className="text-muted">{category}</small>

        {/* Название товара */}
        <Card.Title className="product-title">{name}</Card.Title>

        {/* Рейтинг и отзывы */}
        <div className="d-flex align-items-center mb-2">
          <div className="rating">
            {[...Array(5)].map((_, index) => (
              <FaStar 
                key={index} 
                className={index < rating ? 'text-warning' : 'text-muted'} 
                size={14}
              />
            ))}
          </div>
          <small className="text-muted ms-1">({reviewsCount})</small>
        </div>

        {/* Цены */}
        <div className="price-section mb-3">
          <span className="current-price fs-4 fw-bold text-primary">
            {price.toLocaleString('ru-RU')} ₽
          </span>
          {oldPrice > price && (
            <span className="old-price text-muted text-decoration-line-through ms-2">
              {oldPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-auto">
          {inStock ? (
            <div className="d-grid gap-2">
              <Button variant="primary" className="add-to-cart-btn">
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