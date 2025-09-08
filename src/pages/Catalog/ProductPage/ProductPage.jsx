import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Image, Button, Badge, Tabs, Tab, Alert,
  Spinner, Form
} from 'react-bootstrap';
import { 
  FaHeart, FaShoppingCart, FaStar, FaShare, 
  FaChevronLeft, FaChevronRight, FaRegHeart
} from 'react-icons/fa';
import { getProductById } from '../../../services/categoryService';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

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
    // Логика добавления в корзину
    console.log('Добавлено в корзину:', { product, quantity });
    // Здесь можно добавить вызов контекста корзины или Redux
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // Логика добавления/удаления из избранного
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
        {/* Галерея изображений */}
        <Col lg={6} className="product-gallery">
          <div className="main-image-container">
            <Image 
              src={product.images[selectedImageIndex]} 
              alt={product.name}
              className="main-product-image"
              fluid
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения';
              }}
            />
            
            {product.images.length > 1 && (
              <>
                <Button 
                  variant="light" 
                  className="nav-btn prev-btn"
                  onClick={handlePrevImage}
                >
                  <FaChevronLeft />
                </Button>
                <Button 
                  variant="light" 
                  className="nav-btn next-btn"
                  onClick={handleNextImage}
                >
                  <FaChevronRight />
                </Button>
              </>
            )}

            {product.isNew && (
              <Badge bg="success" className="new-badge">Новинка</Badge>
            )}
            {product.discount > 0 && (
              <Badge bg="danger" className="discount-badge">-{product.discount}%</Badge>
            )}
          </div>

          {/* Миниатюры */}
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    fluid
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80/8767c2/ffffff?text=Img';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Информация о товаре */}
        <Col lg={6} className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {/* Рейтинг и отзывы */}
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index}
                  color={index < Math.floor(product.rating) ? '#ffc107' : '#e4e5e9'}
                />
              ))}
            </div>
            <span className="rating-value">{product.rating}</span>
            <span className="reviews-count">({product.reviewsCount} отзывов)</span>
          </div>

          {/* Цена */}
          <div className="price-section">
            <span className="current-price">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            {product.oldPrice > product.price && (
              <span className="old-price">
                {product.oldPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>

          {/* Наличие */}
          <div className="availability">
            <Badge bg={product.inStock ? 'success' : 'danger'}>
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </Badge>
            {product.inStock && (
              <span className="stock-text ms-2">Доставка завтра</span>
            )}
          </div>

          {/* Количество и кнопки */}
          <div className="action-section">
            <div className="quantity-selector">
              <Form.Label htmlFor="quantity">Количество:</Form.Label>
              <Form.Select 
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ width: '100px' }}
                disabled={!product.inStock}
              >
                {[...Array(Math.min(product.inStock ? 10 : 0, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </Form.Select>
            </div>

            <div className="action-buttons">
              <Button 
                variant="primary" 
                size="lg" 
                disabled={!product.inStock}
                className="add-to-cart-btn"
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
                {isInWishlist ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                {isInWishlist ? 'В избранном' : 'В избранное'}
              </Button>

              <Button variant="outline-secondary" className="share-btn">
                <FaShare className="me-2" />
                Поделиться
              </Button>
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