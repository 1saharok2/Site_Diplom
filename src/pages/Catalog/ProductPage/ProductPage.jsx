import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Alert, Spinner
} from 'react-bootstrap';
import { getProductById } from '../../../services/categoryService';
import './ProductPage_css/ProductPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
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

  const handleAddToCart = () => {
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 600);
    console.log('Добавлено в корзину:', { product });
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
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
        <Col lg={6}>
          <ProductGallery 
            product={product}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
          />
        </Col>

        {/* Информация о товаре */}
        <Col lg={6} className="product-info">
          <ProductInfo 
            product={product}
            isInCart={isInCart}
            isInWishlist={isInWishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onShare={handleShare}
          />
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