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
import './ContactsPage.css';

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
    <Box className="contactsPage">
      <Container maxWidth="lg">
        {/* Заголовок */}
        <Box className="contactsHeader">
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            className="contactsTitle"
            gutterBottom
          >
            Контакты
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h5'}
            color="text.secondary"
            className="contactsSubtitle"
          >
            Свяжитесь с нами любым удобным способом. Мы всегда рады помочь!
          </Typography>
        </Box>

        <Grid container spacing={4} direction="column" className="contactsGrid">
          {/* Контактная информация - ЛЕВАЯ КОЛОНКА */}
          <Grid item xs={12}>
            <Box className="contactsLeftColumn">
              {/* Блок "Наши контакты" */}
              <Paper elevation={3} className="contactsInfoBlock">
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  className="contactsInfoTitle"
                  gutterBottom
                >
                  Наши контакты
                </Typography>

                <Grid container spacing={3}>
                  {contactMethods.map((method, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card className="contactCard">
                        <CardContent>
                          <Box className="contactIcon">
                            {method.icon}
                          </Box>
                          <Typography variant="h6" className="contactCardTitle" gutterBottom>
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
              <Paper elevation={3} className="mapBlock">
                <Typography
                  variant="h6"
                  className="mapTitle"
                  gutterBottom
                >
                  Мы на карте
                </Typography>
                <Box className="mapContainer">
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
          <Grid item xs={12}>
            <Paper elevation={3} className="formBlock">
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                className="formTitle"
                gutterBottom
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
                className="formContainer"
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
                    className="formField"
                  />
                ))}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  className="submitButton"
                >
                  Отправить сообщение
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Дополнительный блок */}
        <Paper elevation={2} className="emergencyBlock">
          <Typography variant={isMobile ? 'h6' : 'h5'} className="emergencyTitle" gutterBottom>
            Нужна срочная помощь?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Звоните нам прямо сейчас по телефону горячей линии
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            className="emergencyPhone"
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