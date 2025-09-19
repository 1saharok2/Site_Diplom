import React, { useState, useEffect } from 'react';
import { Button, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaShare, FaStar, FaRegHeart, FaCheck } from 'react-icons/fa';
import { supabase } from '../../../services/supabaseClient'
import './ProductPage_css/ProductInfo.css';

const ProductInfo = ({ product, onVariantChange }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(product);
  const [loading, setLoading] = useState(false);

  // Загрузка вариантов товара
  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      try {
        // Ищем товары с таким же названием (без указания цвета и памяти)
        const baseName = product.name.split(' ').slice(0, 3).join(' '); // "Смартфон Apple iPhone"
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `${baseName}%`)
          .eq('is_active', true)
          .order('price');

        if (error) throw error;

        setVariants(data || []);
        setSelectedVariant(product);
        
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (product?.name) {
      fetchVariants();
    }
  }, [product]);

  // Получаем доступные цвета и объемы памяти
  const availableColors = [...new Set(variants.map(v => v.specifications?.color || '').filter(Boolean))];
  const availableStorage = [...new Set(variants.map(v => v.specifications?.storage || '').filter(Boolean))];

  const handleColorSelect = (color) => {
    const variant = variants.find(v => 
      v.specifications?.color === color && 
      v.specifications?.storage === selectedVariant.specifications?.storage
    ) || variants.find(v => v.specifications?.color === color);
    
    if (variant && onVariantChange) {
      onVariantChange(variant);
      setSelectedVariant(variant);
    }
  };

  const handleStorageSelect = (storage) => {
    const variant = variants.find(v => 
      v.specifications?.storage === storage && 
      v.specifications?.color === selectedVariant.specifications?.color
    ) || variants.find(v => v.specifications?.storage === storage);
    
    if (variant && onVariantChange) {
      onVariantChange(variant);
      setSelectedVariant(variant);
    }
  };

  const handleAddToCart = () => {
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 2000);
    
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemId = selectedVariant.id;
    
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: selectedVariant.price,
        oldPrice: selectedVariant.old_price,
        image: selectedVariant.image_url?.[0] || '',
        quantity: 1,
        color: selectedVariant.specifications?.color,
        storage: selectedVariant.specifications?.storage,
        slug: selectedVariant.slug
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const hasDiscount = selectedVariant.old_price && selectedVariant.price && 
                   Number(selectedVariant.old_price) > Number(selectedVariant.price);

  if (loading) {
    return (
      <div className="product-info">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Загрузка вариантов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-info">
      <h1 className="product-title">
        {product.name.split(' ').slice(0, 3).join(' ')} {/* Базовое название */}
      </h1>

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
                  color={index < Math.floor(selectedVariant.rating || 0) ? '#ffc107' : '#e4e5e9'}
                  size={16}
                />
              ))}
            </div>
            <span className="rating-value">{selectedVariant.rating || 0}</span>
          </div>
          <span className="reviews-count">({selectedVariant.reviews_count || 0} отзывов)</span>
        </div>

        <div className="price-section">
          <span className="current-price">
            {(selectedVariant.price || 0).toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && (
            <>
              <span className="old-price">
                {(selectedVariant.old_price || 0).toLocaleString('ru-RU')} ₽
              </span>
              <div className="price-saving">
                Экономия {((selectedVariant.old_price - selectedVariant.price) / selectedVariant.old_price * 100).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* Выбор цвета */}
      {availableColors.length > 0 && (
        <div className="selection-section">
          <h6>Цвет: {selectedVariant.specifications?.color && <span className="selected-value">{selectedVariant.specifications.color}</span>}</h6>
          <div className="color-options">
            {availableColors.map((color, index) => {
              const variant = variants.find(v => v.specifications?.color === color);
              const isAvailable = variant && variant.stock > 0;
              
              return (
                <button
                  key={index}
                  className={`color-option ${selectedVariant.specifications?.color === color ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                  onClick={() => isAvailable && handleColorSelect(color)}
                  title={color}
                  disabled={!isAvailable}
                >
                  <div 
                    className="color-swatch"
                    style={{ 
                      backgroundColor: getColorHex(color),
                      border: getColorBorder(color)
                    }}
                  />
                  <span className="color-name">{color}</span>
                  {!isAvailable && <span className="stock-badge">Нет</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Выбор объема памяти */}
      {availableStorage.length > 0 && (
        <div className="selection-section">
          <h6>Объем памяти: {selectedVariant.specifications?.storage && <span className="selected-value">{selectedVariant.specifications.storage}</span>}</h6>
          <div className="storage-options">
            {availableStorage.map((storage, index) => {
              const variant = variants.find(v => v.specifications?.storage === storage);
              const isAvailable = variant && variant.stock > 0;
              const priceDiff = variant ? variant.price - variants[0]?.price : 0;
              
              return (
                <button
                  key={index}
                  className={`storage-option ${selectedVariant.specifications?.storage === storage ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                  onClick={() => isAvailable && handleStorageSelect(storage)}
                  disabled={!isAvailable}
                >
                  {storage}
                  {priceDiff > 0 && (
                    <span className="price-diff">+{priceDiff.toLocaleString('ru-RU')} ₽</span>
                  )}
                  {!isAvailable && <span className="stock-badge">Нет</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Информация о наличии */}
      <div className="availability">
        <Badge bg={selectedVariant.stock > 0 ? 'success' : 'danger'}>
          {selectedVariant.stock > 0 ? 'В наличии' : 'Нет в наличии'}
        </Badge>
        {selectedVariant.stock > 0 && (
          <span className="stock-text">Осталось: {selectedVariant.stock} шт.</span>
        )}
      </div>

      {/* КНОПКИ */}
      <div className="action-buttons">
        <Button 
          variant="primary" 
          size="lg" 
          disabled={selectedVariant.stock <= 0}
          className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
          onClick={handleAddToCart}
        >
          <FaShoppingCart className="btn-icon" />
          {isInCart ? 'Добавлено!' : 'В корзину'}
        </Button>
        
        <div className="secondary-buttons">
          <Button 
            variant={isInWishlist ? "danger" : "outline-primary"} 
            className={`wishlist-btn circle-btn ${isInWishlist ? 'added' : ''}`}
            onClick={() => setIsInWishlist(!isInWishlist)}
          >
            {isInWishlist ? <FaHeart /> : <FaRegHeart />}
          </Button>

          <Button 
            variant="outline-secondary" 
            className="share-btn circle-btn"
            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Ссылка скопирована!'))}
          >
            <FaShare />
          </Button>
        </div>
      </div>

      <div className="short-description">
        <p>{selectedVariant.description || 'Описание товара отсутствует'}</p>
      </div>
    </div>
  );
};

// Вспомогательные функции
const getColorHex = (colorName) => {
  const colorMap = {
    'черный': '#000000',
    'белый': '#ffffff',
    'синий': '#007bff',
    'розовый': '#e83e8c',
    'зеленый': '#28a745'
  };
  return colorMap[colorName.toLowerCase()] || '#6c757d';
};

const getColorBorder = (colorName) => {
  const lightColors = ['белый'];
  return lightColors.includes(colorName.toLowerCase()) ? '1px solid #ddd' : 'none';
};

export default ProductInfo;