// pages/User/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Профиль успешно обновлен');
      setIsEditing(false);
    } else {
      setMessage(result.error);
    }
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Личный кабинет
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Профиль</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant="outlined"
                >
                  Редактировать
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Отмена
                  </Button>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                  >
                    Сохранить
                  </Button>
                </Box>
              )}
            </Box>

            {message && (
              <Alert severity={message.includes('успешно') ? 'success' : 'error'} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="tel"
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Box>
            ) : (
              <Box>
                <Typography><strong>Имя:</strong> {currentUser.name}</Typography>
                <Typography><strong>Email:</strong> {currentUser.email}</Typography>
                <Typography><strong>Телефон:</strong> {currentUser.phone || 'Не указан'}</Typography>
                <Typography><strong>Роль:</strong> {currentUser.role}</Typography>
                <Typography>
                  <strong>Дата регистрации:</strong>{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика
              </Typography>
              <Typography>Заказов: 0</Typography>
              <Typography>Избранное: 0</Typography>
              <Typography>Отзывы: 0</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Быстрые действия
              </Typography>
              <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                История заказов
              </Button>
              <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                Избранные товары
              </Button>
              <Button fullWidth variant="outlined">
                Написать отзыв
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;