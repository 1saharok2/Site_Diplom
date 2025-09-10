import React from 'react';
import { Col, Badge, Button } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaShare, FaStar, FaRegHeart } from 'react-icons/fa';

const ProductInfo = ({ 
  product, 
  isInCart, 
  isInWishlist, 
  onAddToCart, 
  onToggleWishlist, 
  onShare 
}) => {
  return (
    <Col lg={6} className="product-info">
      <h1 className="product-title">{product.name}</h1>

      {/* Рейтинг и цена на одном уровне */}
      <div className="rating-price-container">
        {/* Рейтинг и отзывы */}
        <div className="rating-section">
          <div className="stars-container">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index}
                  color={index < Math.floor(product.rating) ? '#ffc107' : '#e4e5e9'}
                  size={16}
                />
              ))}
            </div>
            <span className="rating-value">{product.rating}</span>
          </div>
          <span className="reviews-count">({product.reviewsCount} отзывов)</span>
        </div>

        {/* Цена */}
        <div className="price-section">
          <span className="current-price">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          {product.oldPrice > product.price && (
            <>
              <span className="old-price">
                {product.oldPrice.toLocaleString('ru-RU')} ₽
              </span>
              <div className="price-saving">
                Экономия {((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* Наличие */}
      <div className="availability">
        <Badge bg={product.inStock ? 'success' : 'danger'}>
          {product.inStock ? 'В наличии' : 'Нет в наличии'}
        </Badge>
        {product.inStock && (
          <span className="stock-text">Доставка завтра</span>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="action-section">
        <div className="action-buttons">
          <div className="product-page-buttons">
            <Button 
              variant="primary" 
              size="lg" 
              disabled={!product.inStock}
              className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
              onClick={onAddToCart}
            >
              <FaShoppingCart className="me-2" />
              {isInCart ? 'Добавлено!' : 'Добавить в корзину'}
            </Button>
            
            <Button 
              variant={isInWishlist ? "danger" : "outline-secondary"} 
              className={`wishlist-btn ${isInWishlist ? 'added' : ''}`}
              onClick={onToggleWishlist}
            >
              {isInWishlist ? <FaHeart /> : <FaRegHeart />}
            </Button>
          </div>

          {/* Отдельная кнопка поделиться */}
          <div className="share-button-container">
            <Button 
              variant="outline-secondary" 
              className="share-btn"
              onClick={onShare}
            >
              <FaShare className="me-1" />
              Поделиться
            </Button>
          </div>
        </div>
      </div>

      {/* Краткое описание */}
      <div className="short-description">
        <p>{product.description}</p>
      </div>
    </Col>
  );
};

export default ProductInfo;