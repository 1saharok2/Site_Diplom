import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategories } from '../../../services/categoryService';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Ошибка загрузки категорий');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка категорий...</span>
        </Spinner>
        <p className="mt-3">Загружаем категории...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="categories-page">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Категории товаров</h1>
        <p className="lead text-muted">Выберите интересующую вас категорию</p>
      </div>

      <Col>
        {categories.map((category) => (
          <Col key={category.id} xs={12} sm={6} lg={4} className="mb-4">
            <Card className="category-card h-100 shadow-sm">
              <div className="category-image-container">
                <Card.Img 
                  variant="top" 
                  src={category.image || '/images/placeholder.jpg'} 
                  alt={category.name}
                  className="category-image"
                />
                <div className="product-count-badge">
                  <span className="badge bg-primary">{category.productCount} товаров</span>
                </div>
              </div>
              
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">{category.name}</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  {category.description}
                </Card.Text>
                <Button 
                  as={Link} 
                  to={`/catalog/${category.slug}`}
                  variant="primary"
                  size="lg"
                  className="mt-auto"
                >
                  Смотреть товары
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Col>

      {categories.length === 0 && !loading && (
        <div className="text-center mt-5">
          <Alert variant="info">
            <Alert.Heading>Категории не найдены</Alert.Heading>
            <p>Пока нет доступных категорий товаров</p>
          </Alert>
        </div>
      )}
    </Container>
  );
};

export default CategoriesPage;