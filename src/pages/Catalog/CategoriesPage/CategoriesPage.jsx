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

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={category.image}
                  alt={category.name}
                  sx={{
                    objectFit: 'cover'
                  }}
                />
                <Chip
                  label={`${category.productsCount || 0} товаров`}
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h3" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                  {category.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    flexGrow: 1,
                    mb: 2,
                    minHeight: '60px'
                  }}
                >
                  {category.description}
                </Typography>
                <Button
                  component={Link}
                  to={`/catalog?category=${category.slug}`}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'bold'
                  }}
                >
                  Смотреть товары
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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