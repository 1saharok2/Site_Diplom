import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Divider,
  TextField,
  Button
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  Telegram,
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2d3748',
        color: 'white',
        mt: 'auto',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Информация о компании */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              🛍️ Электроник
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Ваш надежный партнер в мире электроники и техники. 
              Мы предлагаем только качественные товары по лучшим ценам 
              с гарантией и быстрой доставкой.
            </Typography>
            
            {/* Контактная информация */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ fontSize: 18, mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +7 (999) 123-45-67
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ fontSize: 18, mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  info@electronik.ru
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 18, mr: 1, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  г. Курск, ул. Белгородская, д. 14
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Навигационные ссылки */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Магазин
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                to="/catalog"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Все товары
              </MuiLink>
              <MuiLink
                component={Link}
                to="/catalog?category=smartphones"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Смартфоны
              </MuiLink>
              <MuiLink
                component={Link}
                to="/catalog?category=laptops"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Ноутбуки
              </MuiLink>
              <MuiLink
                component={Link}
                to="/catalog?category=accessories"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Аксессуары
              </MuiLink>
              <MuiLink
                component={Link}
                to="/catalog?category=audio"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Аудиотехника
              </MuiLink>
            </Box>
          </Grid>

          {/* Полезные ссылки */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Полезное
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                to="/about"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                О нас
              </MuiLink>
              <MuiLink
                component={Link}
                to="/contacts"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                Контакты
              </MuiLink>
              <MuiLink
                component={Link}
                to="/faq"
                color="inherit"
                sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                FAQ
              </MuiLink>
            </Box>
          </Grid>

          {/* Подписка на рассылку */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Подписка на новости
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Подпишитесь на рассылку и будьте в курсе новых поступлений, 
              акций и специальных предложений
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Ваш email"
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                <Send />
              </Button>
            </Box>

            {/* Социальные сети */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                Мы в соцсетях:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <Instagram />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  <Telegram />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Нижняя часть футера */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2025 Электроник. Все права защищены.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink
              component={Link}
              to="/privacy"
              color="inherit"
              sx={{ textDecoration: 'none', opacity: 0.7, fontSize: '0.875rem', '&:hover': { opacity: 1 } }}
            >
              Политика конфиденциальности
            </MuiLink>
            <MuiLink
              component={Link}
              to="/terms"
              color="inherit"
              sx={{ textDecoration: 'none', opacity: 0.7, fontSize: '0.875rem', '&:hover': { opacity: 1 } }}
            >
              Условия использования
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;