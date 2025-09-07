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
  useMediaQuery
} from '@mui/material';
import {
  Store,
  LocalShipping,
  Security,
  SupportAgent
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Store sx={{ fontSize: 40 }} />,
      title: 'Широкий ассортимент',
      description: 'Более 1000 товаров различных категорий от проверенных производителей'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Быстрая доставка',
      description: 'Доставляем заказы по всей России за 1-3 рабочих дня'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Гарантия качества',
      description: 'Все товары проходят тщательную проверку перед отправкой'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: 'Поддержка 24/7',
      description: 'Наша служба поддержки всегда готова помочь вам'
    }
  ];

  const team = [
    {
      name: 'Анна Иванова',
      position: 'CEO & Основатель',
      avatar: 'https://via.placeholder.com/100x100?text=AI'
    },
    {
      name: 'Петр Сидоров',
      position: 'Технический директор',
      avatar: 'https://via.placeholder.com/100x100?text=PS'
    },
    {
      name: 'Мария Петрова',
      position: 'Менеджер по продажам',
      avatar: 'https://via.placeholder.com/100x100?text=MP'
    }
  ];

  return (
    <Box sx={{ py: 8, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Герой секция */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 3
            }}
          >
            О нашем магазине
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
          >
            Мы - современный интернет-магазин, который заботится о качестве товаров 
            и удовлетворенности каждого клиента. Наша миссия - делать покупки 
            удобными и приятными.
          </Typography>
        </Box>

        {/* История компании */}
        <Paper
          elevation={2}
          sx={{
            p: 6,
            mb: 8,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Наша история
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                Магазин был основан в 2020 году с целью предоставления качественных товаров 
                по доступным ценам. За это время мы выросли из небольшого стартапа в 
                надежного партнера для тысяч клиентов по всей стране.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Мы постоянно развиваемся, добавляем новые категории товаров и улучшаем 
                сервис, чтобы сделать ваши покупки еще удобнее.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  backgroundImage: 'url(https://via.placeholder.com/500x300?text=Наш+Магазин)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Преимущества */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 6 }}
          >
            Почему выбирают нас
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
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
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Команда */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 6 }}
          >
            Наша команда
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Avatar
                      src={member.avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        border: '4px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary.main"
                      gutterBottom
                      sx={{ fontWeight: 'medium' }}
                    >
                      {member.position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Опытный специалист с многолетним стажем работы
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Статистика */}
        <Paper
          elevation={2}
          sx={{
            p: 6,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                10K+
              </Typography>
              <Typography variant="h6">Довольных клиентов</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                1000+
              </Typography>
              <Typography variant="h6">Товаров в каталоге</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                3
              </Typography>
              <Typography variant="h6">Года на рынке</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                24/7
              </Typography>
              <Typography variant="h6">Поддержка</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;