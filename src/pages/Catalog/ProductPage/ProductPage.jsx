import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  const [product, setProduct] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  // Мемоизированные вычисления
  const hasUserReviewed = useMemo(() => {
    if (!currentUser) return false;
    if (hasSubmittedReview) return true;
    return reviews.some(review => review.user_id === currentUser.id);
  }, [currentUser, reviews, hasSubmittedReview]);

  const averageRating = useMemo(() => 
    reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0,
    [reviews]
  );

  // Мемоизированные обработчики
  const handleVariantChange = useCallback((variant) => {
    setCurrentProduct(variant);
  }, []);

  const handleWriteReview = useCallback(() => {
    if (!currentUser) {
      setMessage('⚠️ Войдите в систему, чтобы оставить отзыв');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [currentUser]);

  const handleSubmitReview = useCallback(async (reviewData) => {
    if (!currentUser) {
      throw new Error('Пожалуйста, войдите в систему, чтобы оставить отзыв');
    }

    try {
      await createReview(reviewData);
      setHasSubmittedReview(true);
      setMessage('✅ Отзыв успешно отправлен на модерацию');
      setTimeout(() => setMessage(''), 4000);
      // Обновляем список отзывов, на случай если API вернёт запись
      await loadProductReviews(reviewData.product_id);
    } catch (error) {
      const errorMessage = error?.message || 'Не удалось отправить отзыв. Попробуйте позже.';
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(''), 4000);
      throw error;
    }
  }, [createReview, currentUser, loadProductReviews]);

  useEffect(() => {
    setHasSubmittedReview(false);
  }, [id, currentUser?.id]);

  // Оптимизированная загрузка данных
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔄 Загрузка данных товара...');
        setLoading(true);
        setError('');

        // Параллельная загрузка товара и отзывов
        const [productData] = await Promise.all([
          categoryService.getProductById(id),
          loadProductReviews(id)
        ]);
        
        if (!productData) {
          throw new Error('Товар не найден');
        }
        
        console.log('📦 Продукт получен:', productData);
        setProduct(productData);
        setCurrentProduct(productData);
        
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

  // Мемоизированные значения для пропсов
  const productInfoProps = useMemo(() => ({
    product: currentProduct || product,
    onVariantChange: handleVariantChange,
    reviewsCount: reviews.length,
    averageRating,
    onWriteReview: handleWriteReview,
    hasUserReviewed,
    isAuthenticated: !!currentUser
  }), [currentProduct, product, handleVariantChange, reviews.length, averageRating, handleWriteReview, hasUserReviewed, currentUser]);

  const productTabsProps = useMemo(() => ({
    product: currentProduct || product,
    reviews,
    reviewsLoading,
    onWriteReview: handleWriteReview,
    onSubmitReview: handleSubmitReview,
    hasUserReviewed,
    isAuthenticated: !!currentUser,
    currentUser
  }), [
    currentProduct, 
    product, 
    reviews, 
    reviewsLoading, 
    handleWriteReview, 
    handleSubmitReview, 
    hasUserReviewed, 
    currentUser
  ]);

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
          <ProductInfo {...productInfoProps} />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <ProductTabs {...productTabsProps} />
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(ProductPage);