// src/pages/ProductPage/ProductPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge } from 'react-bootstrap';

const ProductPage = () => {
  const { id } = useParams();
  
  // Здесь будет запрос к API для получения данных о товаре
  // Пока используем mock данные
  const product = {
    id: 1,
    name: 'Смартфон Apple iPhone 16',
    price: 79990,
    oldPrice: 84900,
    images: ['/assets/products/Phones/iphone.png'],
    category: 'smartphones',
    rating: 4.0,
    reviewsCount: 128,
    isNew: true,
    discount: 6,
    inStock: true,
    description: 'Новый iPhone 16 с улучшенной камерой'
  };

  return (
    <Container className="product-page">
      <Row>
        <Col md={6}>
          <Image src={product.images[0]} fluid />
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          <div className="price-section">
            <span className="current-price">{product.price} ₽</span>
            {product.oldPrice && (
              <span className="old-price">{product.oldPrice} ₽</span>
            )}
            {product.discount && (
              <Badge bg="danger">-{product.discount}%</Badge>
            )}
          </div>
          <Button variant="primary" size="lg">Добавить в корзину</Button>
          <p>{product.description}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;