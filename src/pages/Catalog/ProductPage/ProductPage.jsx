import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Image, Button, Badge, Alert,
  Spinner, Carousel
} from 'react-bootstrap';
import { 
  FaHeart, FaShoppingCart, FaStar, FaShare, FaRegHeart
} from 'react-icons/fa';
import { categoryService } from '../../../services/categoryService';
import './ProductPage_css/ProductPage.css';
import ProductTabs from "./ProductsTabs.jsx";
import ProductInfo from './ProductInfo';
import ProductGallery from './ProductGallery';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Загрузка товара с ID:', id);
        
        const productData = await categoryService.getProductById(id);
        console.log('Товар загружен:', productData);
        
        setProduct(productData);
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        setError(err.message || 'Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleNextImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleAddToCart = () => {
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 600);
    
    // Сохраняем в localStorage
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
    console.log('Товар добавлен в корзину:', product.name);
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!isInWishlist) {
      if (!wishlist.find(item => item.id === product.id)) {
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0]
        });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    } else {
      const updatedWishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.shortDescription,
        url: window.location.href,
      }).catch(error => {
        console.log('Ошибка при использовании Web Share API:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Ссылка скопирована в буфер обмена!');
        })
        .catch(error => {
          console.log('Ошибка при копировании:', error);
        });
    }
  };

  // Получаем безопасный массив изображений
  const getSafeImages = () => {
    if (!product || !product.images || !Array.isArray(product.images)) {
      return ['https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения'];
    }
    return product.images.length > 0 
      ? product.images 
      : ['https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения'];
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      }).catch(error => {
        console.log('Ошибка при использовании Web Share API:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Ссылка скопирована в буфер обмена!');
        })
        .catch(error => {
          console.log('Ошибка при копировании:', error);
        });
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-3">Загружаем информацию о товаре...</p>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка!</Alert.Heading>
          <p>{error || 'Товар не найден'}</p>
          <Link to="/catalog" className="btn btn-primary mt-2">
            Вернуться в каталог
          </Link>
        </Alert>
      </Container>
    );
  }

  const images = getSafeImages();
  const hasDiscount = product.oldPrice > product.price;

  return (
    <Container className="product-page">
      {/* Хлебные крошки */}
      <nav aria-label="breadcrumb" className="my-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/catalog/${product.category}`}>
              {product.categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <Row>
        {/* Галерея изображений с каруселью */}
        <Col lg={6} className="product-gallery">
          <Carousel 
            activeIndex={selectedImageIndex} 
            onSelect={setSelectedImageIndex}
            interval={null}
            indicators={images.length > 1}
            className="product-carousel"
          >
            {images.map((image, index) => (
              <Carousel.Item key={index}>
                <div className="main-image-container">
                  <div className="image-wrapper">
                    <Image 
                      src={image} 
                      alt={product.name}
                      className="main-product-image"
                      fluid
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения';
                      }}
                    />
                  </div>
                  
                  {product.isNew && (
                    <Badge bg="success" className="new-badge">Новинка</Badge>
                  )}
                  {hasDiscount && (
                    <Badge bg="danger" className="discount-badge">
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </Badge>
                  )}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>

          {/* Миниатюры */}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    fluid
                  />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Информация о товаре */}
        <Col lg={6} className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {product.brand && (
            <div className="product-brand mb-2">
              <span className="text-muted">Бренд: </span>
              <strong>{product.brand}</strong>
            </div>
          )}

          {/* Рейтинг и цена на одном уровне */}
          <div className="rating-price-container">
            {/* Рейтинг и отзывы */}
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

            {/* Цена */}
            <div className="price-section">
              <span className="current-price">
                {(product.price || 0).toLocaleString('ru-RU')} ₽
              </span>
              {product.oldPrice > product.price && (
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

          {/* Наличие */}
          <div className="availability mb-3">
            <Badge bg={product.inStock ? 'success' : 'danger'}>
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </Badge>
            {product.inStock && product.stock > 0 && (
              <span className="stock-text">Осталось: {product.stock} шт.</span>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="action-section">
            <div className="action-buttons">
<div className="action-buttons mb-4">
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
            </div>
          </div>

          {/* Краткое описание */}
          <div className="short-description">
            <p>{product.description || 'Описание товара отсутствует'}</p>
          </div>
        </Col>
      </Row>

      {/* Детальная информация */}
      <Row className="mt-5">
        <Col>
          <ProductTabs product={product} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;