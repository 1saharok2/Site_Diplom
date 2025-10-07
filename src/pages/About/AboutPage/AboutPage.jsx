// pages/About/AboutPage.jsx
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  Chip
} from '@mui/material';
import {
  Store,
  LocalShipping,
  Security,
  SupportAgent,
  People,
  TrendingUp,
  CalendarToday,
  AccessTime,
  EmojiEvents,
  Group
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import './AboutPage.css'; // импорт стилей

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AboutPage = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Store sx={{ fontSize: 48 }} />,
      title: 'Широкий ассортимент',
      description: 'Более 1000 товаров различных категорий от проверенных производителей'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48 }} />,
      title: 'Быстрая доставка',
      description: 'Доставляем заказы по всей России за 1–3 рабочих дня'
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Гарантия качества',
      description: 'Все товары проходят тщательную проверку перед отправкой'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 48 }} />,
      title: 'Поддержка 24/7',
      description: 'Наша служба поддержки всегда готова помочь вам'
    }
  ];

  const team = [
    {
      name: 'Коробков Иван',
      position: 'CEO & Основатель',
      avatar: 'https://sun9-27.userapi.com/s/v1/ig2/ShNjTKtflQCrq_Zw2hmhz4pDaTPPcuwlLvH0n51gN9xEmdJ0QCpmj7osgiZUYLKA8qIp7jQh_-Jhq_FKxffWJQQY.jpg?quality=95',
      description: 'Опытный специалист с многолетним стажем в e-commerce'
    },
    {
      name: 'Стариков Александр',
      position: 'Технический директор',
      avatar: 'https://sun9-16.userapi.com/s/v1/ig2/0IVJKFRSbnfYlSUUKbup5iRSWByxpV8PsnFBGZC4Ic6X5U3TU5j7ftsszpdNRDaMElKAdYZFL6FWW1X2XfEXUdq2.jpg?quality=95',
      description: 'Профессиональный программист и лидер технической команды'
    },
    {
      name: 'Амин Гусейнли',
      position: 'Менеджер по продажам',
      avatar: 'https://sun9-69.userapi.com/s/v1/ig2/SZzuY37sbGi3NhpwAfQidMWHFSMr1c9IV5fnt-L7gY4oUZm__Mlqtwz_H1blJ5G6AlOiWYuJ1IViHWaa4IwpaeC7.jpg?quality=95',
      description: 'Эксперт в области клиентского сервиса и управления продажами'
    }
  ];

  const stats = [
    { icon: <People sx={{ fontSize: 32 }} />, value: '10K+', label: 'Довольных клиентов' },
    { icon: <Store sx={{ fontSize: 32 }} />, value: '1000+', label: 'Товаров в каталоге' },
    { icon: <CalendarToday sx={{ fontSize: 32 }} />, value: '3', label: 'Года на рынке' },
    { icon: <AccessTime sx={{ fontSize: 32 }} />, value: '24/7', label: 'Поддержка' }
  ];

  return (
    <Box className="about-page">
      {/* Герой секция */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <Zoom in={true} timeout={1000}>
            <Box className="hero-content">
              <Typography variant="h1" className="hero-title">
                О нашем магазине
              </Typography>
              <Typography variant="h5" className="hero-subtitle">
                Мы создаём будущее розничной торговли, объединяя технологии и сервис для вашего комфорта
              </Typography>
            </Box>
          </Zoom>
        </Container>
      </Box>

      {/* Контент */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        {/* Преимущества */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h2" align="center" gutterBottom className="section-title">
            Почему выбирают нас
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Slide direction="up" in={true} timeout={800 + index * 200}>
                  <Card className="feature-card">
                    <CardContent>
                      <Box className="feature-icon">{feature.icon}</Box>
                      <Typography variant="h5" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2">{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Команда */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h2" align="center" gutterBottom className="section-title">
            Наша команда
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in={true} timeout={1000 + index * 300}>
                  <Card className="team-card">
                    <CardContent>
                      <Avatar src={member.avatar} className="team-avatar" />
                      <Typography variant="h6" gutterBottom>{member.name}</Typography>
                      <Typography variant="body1" color="primary.main" gutterBottom>
                        {member.position}
                      </Typography>
                      <Typography variant="body2">{member.description}</Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Статистика */}
        <Paper elevation={0} className="stats-section">
          <Typography variant="h3" gutterBottom className="stats-title">
            Мы в цифрах
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in={true} timeout={1500 + index * 200}>
                  <Box>
                    <Box className="stat-icon">{stat.icon}</Box>
                    <Typography variant="h2" className="stat-value">{stat.value}</Typography>
                    <Typography variant="h6">{stat.label}</Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;
