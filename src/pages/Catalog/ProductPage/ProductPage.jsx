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
import { apiService } from '../../../services/api';
import PersonalizedRecommendations from '../../../components/PersonalizedRecommendations';
import './ProductPage_css/ProductPage.css';

// Прямое соответствие slug → русское название (из вашей базы данных)
const categoryNames = {
  smartphones: 'Смартфоны',
  laptops: 'Ноутбуки',
  tvs: 'Телевизоры',
  headphones: 'Наушники',
  photo: 'Фототехника',
  gaming: 'Игровые консоли',
  appliances: 'Бытовая техника',
  smarthouse: 'Умный дом',
  // добавьте остальные при необходимости
};

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

  // Простая функция получения русского названия категории по slug
  const getCategoryName = useCallback((product) => {
    if (!product) return 'Категория';
    const slug = product.category_slug || product.category;
    if (!slug) return 'Категория';
    const normalized = slug.toLowerCase().trim();
    // Возвращаем русское название или сам slug, если не найдено
    return categoryNames[normalized] || normalized;
  }, []);

  const averageRating = useMemo(() => 
    reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0,
    [reviews]
  );

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
      setMessage('✅ Отзыв успешно отправлен на модерацию');
      setTimeout(() => setMessage(''), 4000);
      await loadProductReviews(reviewData.product_id);
    } catch (error) {
      const errorMessage = error?.message || 'Не удалось отправить отзыв. Попробуйте позже.';
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(''), 4000);
      throw error;
    }
  }, [createReview, currentUser, loadProductReviews]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔄 Загрузка данных товара...');
        setLoading(true);
        setError('');

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

  const productInfoProps = useMemo(() => ({
    product: currentProduct || product,
    onVariantChange: handleVariantChange,
    reviewsCount: reviews.length,
    averageRating,
    onWriteReview: handleWriteReview,
    isAuthenticated: !!currentUser
  }), [currentProduct, product, handleVariantChange, reviews.length, averageRating, handleWriteReview, currentUser]);

  const productTabsProps = useMemo(() => ({
    product: currentProduct || product,
    reviews,
    reviewsLoading,
    onWriteReview: handleWriteReview,
    onSubmitReview: handleSubmitReview,
    isAuthenticated: !!currentUser,
    currentUser
  }), [
    currentProduct, 
    product, 
    reviews, 
    reviewsLoading, 
    handleWriteReview, 
    handleSubmitReview, 
    currentUser
  ]);

    // Трекинг просмотра товара
  useEffect(() => {
    if (product?.id && currentUser?.id) {
      const trackView = async () => {
        try {
          await apiService.post('/track-action.php', {
            userId: currentUser.id,
            productId: product.id,
            action: 'view'
          });
        } catch (error) {
          console.error('Ошибка отправки просмотра:', error);
        }
      };
      trackView();
    }
  }, [product?.id, currentUser?.id]); // сработает при загрузке товара или смене пользователя

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
          {getCategoryName(product)}
        </Breadcrumb.Item>
        
        <Breadcrumb.Item active className="d-flex align-items-center">
          <FaChevronRight className="me-1 mx-1" size={10} />
          <span className="text-truncate">{currentProduct?.name || product.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

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

      <PersonalizedRecommendations currentProductId={product.id} limit={8} />
    </Container>
  );
};

export default React.memo(ProductPage);