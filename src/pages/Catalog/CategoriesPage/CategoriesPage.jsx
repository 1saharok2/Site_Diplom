import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../../services/categoryService';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAllCategories();
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

  // Функция для склонения слова "товар"
  const getProductCountText = (count) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'товар';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'товара';
    return 'товаров';
  };

  // Обработчик клика по всей карточке
  const handleCardClick = (categorySlug) => {
    navigate(`/catalog/${categorySlug}`);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка категорий...</span>
        </Spinner>
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

      <div className="categories-grid">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => handleCardClick(category.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-image-container">
              <img 
                src={category.image || '/images/placeholder.jpg'}
                alt={category.name}
                className="category-image"
                onError={(e) => {
                  if (!e.target.src.includes('placeholder') && !e.target.src.includes('via.placeholder.com')) {
                    e.target.src = `https://via.placeholder.com/400x300/6c757d/ffffff?text=${encodeURIComponent(category.name.slice(0, 15))}`;
                  }
                }}
              />
              <div className="product-count-badge">
                <span className="badge bg-primary">
                  {category.productCount} {getProductCountText(category.productCount)}
                </span>
              </div>
            </div>
            
            <div className="card-body-content">
              <h5 className="category-title" title={category.name}>
                {category.name}
              </h5>
              <p className="category-description" title={category.description}>
                {category.description || 'Описание категории появится скоро'}
              </p>
              
              <div 
                className="btn btn-primary view-products-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/catalog/${category.slug}`);
                }}
              >
                Смотреть товары
              </div>
            </div>
          </div>
        ))}
      </div>

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