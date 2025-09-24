import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { categoryService } from '../../../services/categoryService';
import { useAuth } from '../../../context/AuthContext';
import { useReviews } from '../../../context/ReviewContext';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductsTabs';
import './ProductPage_css/ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { 
    reviews, 
    loading: reviewsLoading, 
    loadProductReviews, 
    createReview 
  } = useReviews();

  console.log('🔴 ProductPage - ID товара:', id);
  console.log('📊 ProductPage - Отзывы:', reviews);
  console.log('👤 ProductPage - Пользователь:', currentUser);
  console.log('⏳ ProductPage - Загрузка:', reviewsLoading);
  
  const [product, setProduct] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔄 Загрузка данных товара и отзывов...');
        setLoading(true);
        console.log('🔄 Загрузка товара с ID:', id);
        
        const productData = await categoryService.getProductById(id);
        
        if (!productData) {
          throw new Error('Товар не найден');
        }
        
        console.log('📦 Продукт получен:', productData);
        console.log('🖼️ Изображения продукта:', productData.image_url);
        console.log('📊 Количество изображений:', productData.image_url?.length || 0);
        
        setProduct(productData);
        setCurrentProduct(productData);
        
        // Загружаем отзывы для этого товара
        await loadProductReviews(id);
        console.log('🔴 Статус первого отзыва:', reviews[0]?.status);
        console.log('🔴 Данные первого отзыва:', reviews[0]);
        
      } catch (err) {
        console.error('❌ Ошибка загрузки товара:', err);
        setError(err.message || 'Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError('ID товара не указан');
      setLoading(false);
    }
  }, [id, loadProductReviews]);

  // Проверяем, оставлял ли пользователь уже отзыв
  const hasUserReviewed = currentUser && 
    reviews.some(review => review.user_id === currentUser.id);

  // Вычисляем средний рейтинг
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleVariantChange = (variant) => {
    setCurrentProduct(variant);
  };



  const handleWriteReview = () => {
    if (!currentUser) {
      setMessage('⚠️ Войдите в систему, чтобы оставить отзыв');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setReviewFormOpen(true);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
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
      <Breadcrumb className="my-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }} className="d-flex align-items-center">
          <FaHome className="me-1" size={14} />
          Главная
        </Breadcrumb.Item>
        
        <Breadcrumb.Item 
          linkAs={Link} 
          linkProps={{ to: `/catalog/${product.category_slug || product.category}` }}
          className="d-flex align-items-center"
        >
          <FaChevronRight className="me-1 mx-1" size={10} />
          {product.categoryName || product.category_slug || product.category || 'Каталог'}
        </Breadcrumb.Item>
        
        <Breadcrumb.Item active className="d-flex align-items-center">
          <FaChevronRight className="me-1 mx-1" size={10} />
          <span className="text-truncate">{currentProduct?.name || product.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Сообщения */}
      {message && (
        <Alert 
          variant={message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'danger'} 
          className="mt-3"
        >
          {message}
        </Alert>
      )}

      <Row>
        <Col lg={6} className="pe-lg-4">
          <ProductGallery product={currentProduct || product} />
        </Col>

        <Col lg={6} className="ps-lg-4">
          <ProductInfo 
            product={currentProduct || product} 
            onVariantChange={handleVariantChange}
            reviewsCount={reviews.length}
            averageRating={averageRating}
            onWriteReview={handleWriteReview}
            hasUserReviewed={hasUserReviewed}
            isAuthenticated={!!currentUser}
          />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <ProductTabs 
            product={currentProduct || product} 
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            onWriteReview={handleWriteReview}
            hasUserReviewed={hasUserReviewed}
            isAuthenticated={!!currentUser}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;