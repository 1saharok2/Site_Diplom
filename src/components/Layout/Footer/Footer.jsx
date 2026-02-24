import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2d3748',
        color: 'white',
        mt: 'auto',
        pt: 4, // Уменьшено с 6 до 4
        pb: 2  // Уменьшено с 3 до 2
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center"> {/* Уменьшен spacing с 4 до 3 */}
          {/* Информация о компании - занимает 6 колонок на md экранах */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1.5 }}>
              🛍️ Гитон
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, opacity: 0.8, maxWidth: '500px' }}>
              Ваш надежный партнер в мире электроники и техники. 
              Мы предлагаем только качественные товары по лучшим ценам 
              с гарантией и быстрой доставкой.
            </Typography>
            
            {/* Контактная информация в строку на больших экранах */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: { xs: 1, md: 3 },
              mt: 1.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ fontSize: 16, mr: 0.5, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.675rem' }}>
                  +7 (999) 123-45-67
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: 16, mr: 0.5, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.675rem' }}>
                  info@electronik.ru
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 16, mr: 0.5, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.675rem' }}>
                  г. Курск, ул. Белгородская, д. 14
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Навигационные ссылки - смещены вправо */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              gap: 6
            }}>
              {/* Магазин */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Магазин
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <MuiLink
                    component={Link}
                    to="/catalog/smartphones"
                    color="inherit"
                    sx={{ textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
                  >
                    Смартфоны
                  </MuiLink>
                  <MuiLink
                    component={Link}
                    to="/catalog/laptops"
                    color="inherit"
                    sx={{ textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
                  >
                    Ноутбуки
                  </MuiLink>
                  <MuiLink
                    component={Link}
                    to="/catalog/headphones"
                    color="inherit"
                    sx={{ textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
                  >
                    Аудиотехника
                  </MuiLink>
                </Box>
              </Box>

              {/* Полезное */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Полезное
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <MuiLink
                    component={Link}
                    to="/about"
                    color="inherit"
                    sx={{ textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
                  >
                    О нас
                  </MuiLink>
                  <MuiLink
                    component={Link}
                    to="/contacts"
                    color="inherit"
                    sx={{ textDecoration: 'none', opacity: 0.8, fontSize: '0.9rem', '&:hover': { opacity: 1 } }}
                  >
                    Контакты
                  </MuiLink>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} /> {/* Уменьшен отступ с 4 до 3 */}

        {/* Нижняя часть футера */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 1.5 // Уменьшено с 2 до 1.5
        }}>
          <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.8rem' }}>
            © 2025 Гитон. Все права защищены.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}> {/* Уменьшено с 3 до 2 */}
            <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', '&:hover': { textDecoration: 'underline' } }}>
                Политика конфиденциальности
              </Typography>
            </Link>
            <Link to="/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', '&:hover': { textDecoration: 'underline' } }}>
                Условия пользования
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;