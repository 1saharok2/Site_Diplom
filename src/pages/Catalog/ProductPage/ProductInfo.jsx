import React, { useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaShare, FaStar, FaRegHeart } from 'react-icons/fa';
import './ProductPage_css/ProductInfo.css';

const ProductInfo = ({ product }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToCart = () => {
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 600);
    
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!isInWishlist) {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
    } else {
      const updatedWishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Ссылка скопирована в буфер обмена!'));
    }
  };

  const hasDiscount = product.oldPrice > product.price;

  return (
    <div className="product-info">
      <h1 className="product-title">{product.name}</h1>

      {product.brand && (
        <div className="product-brand">
          <span className="text-muted">Бренд: </span>
          <strong>{product.brand}</strong>
        </div>
      )}

      <div className="rating-price-container">
        <div className="rating-section">
          <div className="stars-container">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index}
                  color={index < Math.floor(product.rating || 0) ? '#ffc107' : '#e4e5e9'}
                  size={16}
                />
              ))}
            </div>
            <span className="rating-value">{product.rating || 0}</span>
          </div>
          <span className="reviews-count">({product.reviewsCount || 0} отзывов)</span>
        </div>

        <div className="price-section">
          <span className="current-price">
            {(product.price || 0).toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && (
            <>
              <span className="old-price">
                {(product.oldPrice || 0).toLocaleString('ru-RU')} ₽
              </span>
              <div className="price-saving">
                Экономия {((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      </div>

      <div className="availability">
        <Badge bg={product.inStock ? 'success' : 'danger'}>
          {product.inStock ? 'В наличии' : 'Нет в наличии'}
        </Badge>
        {product.inStock && product.stock > 0 && (
          <span className="stock-text">Осталось: {product.stock} шт.</span>
        )}
      </div>

      <div className="action-buttons">
        <Button 
          variant="primary" 
          size="lg" 
          disabled={!product.inStock}
          className="add-to-cart-btn me-3"
          onClick={handleAddToCart}
        >
          <FaShoppingCart className="me-2" />
          Добавить в корзину
        </Button>
        
        <Button 
          variant={isInWishlist ? "danger" : "outline-secondary"} 
          className="wishlist-btn"
          onClick={handleToggleWishlist}
        >
          {isInWishlist ? <FaHeart /> : <FaRegHeart />}
        </Button>

        <Button 
          variant="outline-secondary" 
          className="share-btn ms-2"
          onClick={handleShare}
        >
          <FaShare />
        </Button>
      </div>

      <div className="short-description">
        <p>{product.description || 'Описание товара отсутствует'}</p>
      </div>
    </div>
  );
};

export default ProductInfo;