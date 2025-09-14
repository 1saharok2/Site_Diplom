import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const {
    name,
    price,
    oldPrice,
    images,
    rating,
    reviewsCount,
    discount,
    inStock
  } = product;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 600);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
  };

  return (
    <div className="product-card-container">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <Card className="product-card">
          {/* Бейджи */}
          <div className="product-badges">
            {discount > 0 && (
              <Badge bg="danger" className="discount-badge">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Картинка товара */}
          <div className="product-image-container">
            <img 
              src={images && images[0] ? images[0] : 'https://via.placeholder.com/300x200/8767c2/ffffff?text=Нет+изображения'}
              alt={name}
              className="product-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200/8767c2/ffffff?text=Нет+изображения';
              }}
            />
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
                    color={index < Math.floor(rating || 0) ? '#ffc107' : '#e4e5e9'} 
                  />
                ))}
              </div>
              <span className="rating-count">({reviewsCount || 0})</span>
            </div>

            {/* Цены */}
            <div className="price-container">
              <span className="current-price">
                {(price || 0).toLocaleString('ru-RU')} ₽
              </span>
              {oldPrice > price && (
                <div className="old-price-container">
                  <span className="old-price">
                    {(oldPrice || 0).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="price-saving">
                    Экономия {Math.round((oldPrice - price) / oldPrice * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="product-actions">
              {inStock ? (
                <div className="action-buttons">
                  <Button 
                    variant="primary" 
                    className={`btn-cart ${isInCart ? 'added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    <FaShoppingCart className="btn-icon" />
                    {isInCart ? 'Добавлено!' : 'В корзину'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className={`btn-wishlist ${isInWishlist ? 'added' : ''}`}
                    onClick={handleAddToWishlist}
                  >
                    <FaHeart />
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
      </Link>
    </div>
  );
};

export default ProductCard;