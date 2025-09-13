import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { categoryService } from '../../../services/categoryService';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductTabs from './ProductsTabs';
import './ProductPage_css/ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await categoryService.getProductById(id);
        setProduct(productData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

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
      <nav aria-label="breadcrumb" className="my-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/catalog/${product.category}`}>
              {product.categoryName || product.category}
            </Link>
          </li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <Row>
        <Col lg={6} className="pe-lg-4">
          <ProductGallery 
            product={product}
            selectedImageIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
          />
        </Col>

        <Col lg={6} className="ps-lg-4">
          <ProductInfo product={product} />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <ProductTabs product={product} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;