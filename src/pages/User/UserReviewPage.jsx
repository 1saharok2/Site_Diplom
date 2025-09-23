import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { useReviews } from '../../context/ReviewContext';

const UserReviewsPage = () => {
  const { userReviews, loading } = useReviews();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мои отзывы
      </Typography>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : userReviews.length === 0 ? (
          <Typography>У вас пока нет отзывов</Typography>
        ) : (
          userReviews.map(review => (
            <Box key={review.id} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
              <Typography variant="h6">{review.product?.name}</Typography>
              <Typography>Рейтинг: {review.rating}/5</Typography>
              <Typography>{review.comment}</Typography>
            </Box>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default UserReviewsPage;