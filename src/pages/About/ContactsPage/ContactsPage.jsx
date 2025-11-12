// pages/Contacts/ContactsPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Grid,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Container maxWidth="md">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, px: 2 }}>
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

        {/* Контактная информация */}
        <Box
          sx={{
            mb: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Наши контакты
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{ maxWidth: 700 }}
          >
            {contactMethods.map((method, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={index}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 300,
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
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{method.icon}</Box>
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
        </Box>

        {/* Карта */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            height: { xs: 300, sm: 350, md: 400 },
            mb: 6
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
          <YandexMap
            center={[51.670550205174614, 36.147750777233355]}
            zoom={16}
          />
        </Paper>

        {/* Форма */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            mb: 6
          }}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center'
            }}
          >
            Напишите нам
          </Typography>

          {isSubmitted && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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

        {/* Нижний блок */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
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
