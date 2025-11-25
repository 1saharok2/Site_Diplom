// pages/Contacts/ContactsPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  useMediaQuery
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  Send
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import YandexMap from '../../../components/YandexMap';

const ContactsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Форма отправлена:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactMethods = [
    {
      icon: <Phone sx={{ fontSize: 30 }} />,
      title: 'Телефон',
      details: '+7 (999) 123-45-67',
      description: 'Звоните нам ежедневно'
    },
    {
      icon: <Email sx={{ fontSize: 30 }} />,
      title: 'Email',
      details: 'info@magazin.ru',
      description: 'Пишите нам на почту'
    },
    {
      icon: <LocationOn sx={{ fontSize: 30 }} />,
      title: 'Адрес',
      details: 'г. Курск, ул. Белгородская, д. 14',
      description: 'Приезжайте в гости'
    },
    {
      icon: <Schedule sx={{ fontSize: 30 }} />,
      title: 'Часы работы',
      details: 'Пн-Пт: 9:00-18:00',
      description: 'Сб-Вс: 10:00-16:00'
    }
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 }, px: 2 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Контакты
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h5'}
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Свяжитесь с нами любым удобным способом. Мы всегда рады помочь!
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 4 : 6} alignItems="stretch">
          {/* Контактная информация - ЛЕВАЯ КОЛОНКА */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {/* Блок "Наши контакты" */}
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  flex: '0 1 auto'
                }}
              >
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 4,
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                >
                  Наши контакты
                </Typography>

                <Grid container spacing={3}>
                  {contactMethods.map((method, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          p: 3,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ color: 'primary.main', mb: 2 }}>
                            {method.icon}
                          </Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {method.title}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {method.details}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Карта */}
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  flex: '1 1 auto',
                  minHeight: 400
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                >
                  Мы на карте
                </Typography>
                <Box sx={{ height: 'calc(100% - 60px)' }}>
                  <YandexMap
                    center={[51.670550205174614, 36.147750777233355]}
                    zoom={16}
                    height="100%"
                  />
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Форма - ПРАВАЯ КОЛОНКА */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                Напишите нам
              </Typography>

              {isSubmitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
                </Alert>
              )}

              <Box 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ flex: 1 }}
              >
                {['name', 'email', 'phone', 'message'].map((field) => (
                  <TextField
                    key={field}
                    fullWidth
                    label={
                      field === 'name'
                        ? 'Ваше имя'
                        : field === 'email'
                        ? 'Email'
                        : field === 'phone'
                        ? 'Телефон'
                        : 'Сообщение'
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required={field !== 'phone'}
                    margin="normal"
                    multiline={field === 'message'}
                    rows={field === 'message' ? 4 : 1}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                  />
                ))}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                    }
                  }}
                >
                  Отправить сообщение
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Дополнительный блок */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            mt: { xs: 6, md: 8 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ fontWeight: 'bold' }}>
            Нужна срочная помощь?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Звоните нам прямо сейчас по телефону горячей линии
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }}
            component="a"
            href="tel:+79991234567"
          >
            +7 (999) 123-45-67
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactsPage;