import React, { useState } from 'react';
import {
  Container,
  TextField,
  Box,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { ArrowBack, Search, Clear } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import { getProductThumbnailSrc } from '../../utils/productImage';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products } = useProducts();
  const navigate = useNavigate();

  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Container sx={{ py: 2 }}>
      {/* Заголовок и поиск */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <TextField
          fullWidth
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchQuery && (
              <IconButton
                size="small"
                onClick={() => setSearchQuery('')}
                edge="end"
              >
                <Clear />
              </IconButton>
            )
          }}
          autoFocus
        />
      </Box>

      {/* Результаты поиска */}
      {searchQuery && (
        <>
          <Typography variant="h6" gutterBottom>
            Результаты поиска {filteredProducts.length > 0 && `(${filteredProducts.length})`}
          </Typography>

          {filteredProducts.length > 0 ? (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 6, sm: 4 }}>
                  <Card 
                    sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                    onClick={() => handleProductClick(product)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={getProductThumbnailSrc(product)}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = `${process.env.PUBLIC_URL || ''}/images/placeholder.jpg`;
                      }}
                      sx={{ objectFit: 'contain', p: 1 }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: 38, sm: 42 }
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {product.price.toLocaleString()} ₽
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
              Товары не найдены
            </Typography>
          )}
        </>
      )}

      {/* Популярные запросы */}
      {!searchQuery && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Популярные запросы
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['Смартфон', 'Ноутбук', 'Наушники', 'Телевизор', 'Планшет'].map((tag) => (
              <Box
                key={tag}
                onClick={() => setSearchQuery(tag)}
                sx={{
                  padding: '8px 16px',
                  backgroundColor: 'grey.100',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'grey.200'
                  }
                }}
              >
                <Typography variant="body2">{tag}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage;