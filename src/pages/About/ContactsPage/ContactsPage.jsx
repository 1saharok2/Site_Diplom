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
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  Send
} from '@mui/icons-material';

const ContactsPage = () => {
  const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    // Здесь будет отправка формы на сервер
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
      details: 'г. Москва, ул. Примерная, д. 123',
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
    <Box sx={{ py: 8, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
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
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Свяжитесь с нами любым удобным способом. Мы всегда рады помочь!
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Контактная информация */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
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
                        <Box
                          sx={{
                            color: 'primary.main',
                            mb: 2
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {method.title}
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
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
            </Box>

            {/* Карта */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Мы на карте
              </Typography>
              <Box
                sx={{
                  height: 300,
                  backgroundImage: 'url(https://via.placeholder.com/600x300?text=Карта+Москвы)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'grey.200'
                }}
              />
            </Paper>
          </Grid>

          {/* Форма обратной связи */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Напишите нам
              </Typography>

              {isSubmitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Ваше имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  type="tel"
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Сообщение"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />

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

        {/* Дополнительная информация */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            mt: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Нужна срочная помощь?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Звоните нам прямо сейчас по телефону горячей линии
          </Typography>
          <Typography
            variant="h4"
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