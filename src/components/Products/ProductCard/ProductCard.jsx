import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlistByProduct, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();

  const {
    name,
    price,
    oldPrice,
    images,
    rating,
    reviewsCount,
    discount,
    inStock,
    id: productId
  } = product;

  const isInWishlistState = isInWishlist(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || !currentUser.id) {
      alert('Пожалуйста, авторизуйтесь чтобы добавить товар в корзину');
      return;
    }
    try {
      setIsAddingToCart(true);
      await addToCart(product.id, 1);
      setTimeout(() => setIsAddingToCart(false), 600);
    } catch (error) {
      alert('Не удалось добавить товар в корзину: ' + error.message);
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || !currentUser.id) {
      alert('Пожалуйста, авторизуйтесь чтобы добавить товар в избранное');
      return;
    }

    try {
      setIsAddingToWishlist(true);
      
      if (isInWishlistState) {
        await removeFromWishlistByProduct(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      alert('Не удалось изменить избранное: ' + error.message);
    } finally {
      setIsAddingToWishlist(false);
    }
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
              src={images && images[0] ? images[0] : '/images/placeholder.jpg'}
              alt={name}
              className="product-image"
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
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
                    className={`btn-cart ${isAddingToCart ? 'adding' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    <FaShoppingCart className="btn-icon" />
                    {isAddingToCart ? 'Добавление...' : 'В корзину'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className={`btn-wishlist ${isInWishlistState ? 'added' : ''} ${isAddingToWishlist ? 'loading' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={isAddingToWishlist}
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