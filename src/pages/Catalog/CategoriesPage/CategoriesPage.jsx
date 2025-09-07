import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { mockCategories } from '../../../data/mockData'; // Импортируем конкретные категории

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setCategories(mockCategories); // Используем конкретные категории из mockData
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Загружаем категории...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Категории товаров
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Выберите интересующую вас категорию
        </Typography>
      </Box>

<div className="categories-grid">
  {categories.map((category) => (
    <div key={category.id} className="category-card">
      <div className="category-image-container">
        <img 
          src={category.image} 
          alt={category.name}
          className="category-image"
        />
        <div className="product-count-badge">
          <span className="badge bg-primary">{category.productCount} товаров</span>
        </div>
      </div>
      
      <div className="card-body-content">
        <h5 className="category-title">{category.name}</h5>
        <p className="category-description">{category.description}</p>
        <Link 
          to={`/catalog/${category.slug}`}
          className="btn btn-primary view-products-btn"
        >
          Смотреть товары
        </Link>
      </div>
    </div>
  ))}
</div>

      {categories.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              Категории не найдены
            </Typography>
            <Typography>
              Пока нет доступных категорий товаров
            </Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default CategoriesPage;