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

  return (
    <Card className="product-card h-100">
      <div className="product-badges">
        {isNew && <Badge bg="success">Новинка</Badge>}
        {discount > 0 && <Badge bg="danger">-{discount}%</Badge>}
      </div>

      <Card.Img 
        variant="top" 
        src={images[0]} 
        alt={name}
        style={{ height: '200px', objectFit: 'cover' }}
      />

      <Card.Body className="d-flex flex-column">
        <Card.Title>{name}</Card.Title>
        
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

        <div className="mt-auto">
          {inStock ? (
            <div className="d-grid gap-2">
              <Button variant="primary">
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