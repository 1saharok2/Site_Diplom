import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Image, Button, Badge, Tabs, Tab, Alert,
  Spinner, Form, Carousel
} from 'react-bootstrap';
import { 
  FaHeart, FaShoppingCart, FaStar, FaShare, 
  FaChevronLeft, FaChevronRight, FaRegHeart
} from 'react-icons/fa';
import { getProductById } from '../../../services/categoryService';
import './ProductPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки товара');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handlePrevImage = () => {
    if (product?.images.length > 1) {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images.length > 1) {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddToCart = () => {
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 600);
    console.log('Добавлено в корзину:', { product, quantity });
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
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

  const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: product.shortDescription,
      url: window.location.href,
    })
    .catch(error => {
      console.log('Ошибка при использовании Web Share API:', error);
    });
  } else {
    // Fallback для браузеров без поддержки Web Share API
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      })
      .catch(error => {
        console.log('Ошибка при копировании:', error);
      });
  }
};

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
              {product.categoryName || product.category}
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
            indicators={product.images.length > 1}
            className="product-carousel"
          >
            {product.images.map((image, index) => (
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
                  {product.discount > 0 && (
                    <Badge bg="danger" className="discount-badge">-{product.discount}%</Badge>
                  )}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>

          {/* Миниатюры */}
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="thumbnail-wrapper">
                    <Image 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      fluid
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/8767c2/ffffff?text=Img';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Информация о товаре */}
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

          {/* Кнопки действий - БЕЗ quantity-selector */}
            <div className="action-section">
              <div className="action-buttons">
                <div className="product-page-buttons">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    disabled={!product.inStock}
                    className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    <FaShoppingCart className="me-2" />
                    {isInCart ? 'Добавлено!' : 'Добавить в корзину'}
                  </Button>
                  
                  <Button 
                    variant={isInWishlist ? "danger" : "outline-secondary"} 
                    className={`wishlist-btn ${isInWishlist ? 'added' : ''}`}
                    onClick={handleToggleWishlist}
                  >
                    {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                  </Button>
                </div>

                {/* Отдельная кнопка поделиться */}
                <div className="share-button-container">
                  <Button 
                    variant="outline-secondary" 
                    className="share-btn"
                    onClick={handleShare}
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
      </Row>

      {/* Детальная информация */}
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="description" className="product-tabs">
            <Tab eventKey="description" title="Описание">
              <div className="tab-content">
                <h4>Подробное описание</h4>
                <p>{product.fullDescription || product.description}</p>
              </div>
            </Tab>
            
            <Tab eventKey="specifications" title="Характеристики">
              <div className="tab-content">
                <h4>Технические характеристики</h4>
                <div className="specs-table">
                  <div className="spec-row">
                    <span className="spec-name">Категория:</span>
                    <span className="spec-value">{product.category}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-name">Рейтинг:</span>
                    <span className="spec-value">{product.rating}/5</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-name">Отзывы:</span>
                    <span className="spec-value">{product.reviewsCount}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-name">Артикул:</span>
                    <span className="spec-value">#{product.id}</span>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab eventKey="reviews" title="Отзывы">
              <div className="tab-content">
                <h4>Отзывы покупателей</h4>
                {product.reviewsCount > 0 ? (
                  <p>Система отзывов будет реализована позже</p>
                ) : (
                  <p>Пока нет отзывов об этом товаре</p>
                )}
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;