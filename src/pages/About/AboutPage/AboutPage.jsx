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

// Анимации
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
      description: 'Доставляем заказы по всей России за 1-3 рабочих дня'
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
      avatar: 'https://sun9-27.userapi.com/s/v1/ig2/ShNjTKtflQCrq_Zw2hmhz4pDaTPPcuwlLvH0n51gN9xEmdJ0QCpmj7osgiZUYLKA8qIp7jQh_-Jhq_FKxffWJQQY.jpg?quality=95&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,960x1280&from=bu&cs=960x0',
      description: 'Опытный специалист с многолетним стажем в e-commerce'
    },
    {
      name: 'Стариков Александр',
      position: 'Технический директор',
      avatar: 'https://sun9-16.userapi.com/s/v1/ig2/0IVJKFRSbnfYlSUUKbup5iRSWByxpV8PsnFBGZC4Ic6X5U3TU5j7ftsszpdNRDaMElKAdYZFL6FWW1X2XfEXUdq2.jpg?quality=95&as=32x43,48x64,72x96,108x144,160x213,240x320,360x480,480x640,540x720,640x853,720x960,1080x1440,1280x1707,1440x1920,1920x2560&from=bu&cs=1280x0',
      description: 'Профессиональный программист и лидер технической команды'
    },
    {
      name: 'Амин Гусейнли',
      position: 'Менеджер по продажам',
      avatar: 'https://sun9-69.userapi.com/s/v1/ig2/SZzuY37sbGi3NhpwAfQidMWHFSMr1c9IV5fnt-L7gY4oUZm__Mlqtwz_H1blJ5G6AlOiWYuJ1IViHWaa4IwpaeC7.jpg?quality=95&as=32x38,48x58,72x87,108x130,160x192,240x289,360x433,480x577,540x650,640x770,720x866,1080x1299,1280x1540,1440x1732,2128x2560&from=bu&cs=1280x0',
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      overflow: 'hidden'
    }}>
      {/* Герой секция */}
      <Box sx={{ 
        position: 'relative',
        pt: 15,
        pb: 10,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop) center/cover',
          opacity: 0.1,
          mixBlendMode: 'overlay'
        }
      }}>
        <Container maxWidth="lg">
          <Zoom in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                О нашем магазине
              </Typography>
              <Typography
                variant="h5"
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto', 
                  lineHeight: 1.6,
                  opacity: 0.9,
                  fontWeight: 300
                }}
              >
                Мы создаём будущее розничной торговли, объединяя передовые технологии 
                с безупречным сервисом для вашего комфорта
              </Typography>
            </Box>
          </Zoom>
        </Container>
      </Box>

      {/* История компании */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Fade in={true} timeout={1500}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              mb: 8,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%'
              }
            }}
          >
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h2" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 3
                  }}
                >
                  Наша история
                </Typography>
<Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3, fontSize: '1.1rem' }}>
                  <strong>TechMarket</strong> был основан в 2020 году тремя друзьями-энтузиастами, 
                  которые верили, что онлайн-шопинг должен быть простым, безопасным и доступным 
                  для каждого. Начиная с небольшого склада в 50 квадратных метров и скромного 
                  ассортимента из 50 товаров, мы прошли incredible путь роста.
                </Typography>

                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3, fontSize: '1.1rem' }}>
                  В 2021 году мы заключили партнерские соглашения с ведущими мировыми брендами, 
                  что позволило значительно расширить ассортимент. К 2022 году наш склад вырос 
                  до 500м², а команда увеличилась с 5 до 25 специалистов.
                </Typography>

                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 4, fontSize: '1.1rem' }}>
                  Сегодня мы гордимся тем, что обслуживаем более 10,000 довольных клиентов 
                  по всей России, предлагая свыше 1000 качественных товаров с гарантией 
                  и быстрой доставкой. Наша миссия - продолжать innovate и делать shopping 
                  максимально удобным для вас.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<EmojiEvents />} label="Лучший магазин 2023" color="primary" variant="outlined" />
                  <Chip icon={<TrendingUp />} label="Рост +200% в год" color="success" variant="outlined" />
                  <Chip icon={<Group />} label="25+ сотрудников" color="secondary" variant="outlined" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    width: '100%',
                    height: 5,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 3,
                    boxShadow: theme.shadows[8],
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                />
              </Grid>
            </Grid>

            
          </Paper>
        </Fade>

        {/* Преимущества */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ 
              fontWeight: 800, 
              mb: 8,
              color: theme.palette.text.primary
            }}
          >
            Почему выбирают нас
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Slide direction="up" in={true} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 4,
                      border: 'none',
                      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                      boxShadow: theme.shadows[2],
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                        '& .feature-icon': {
                          animation: `${floatAnimation} 2s ease-in-out infinite`,
                          color: theme.palette.primary.main
                        }
                      }
                    }}
                  >
                    <CardContent>
                      <Box
                        className="feature-icon"
                        sx={{
                          color: theme.palette.primary.main,
                          mb: 3,
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Команда */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{ 
              fontWeight: 800, 
              mb: 8,
              color: theme.palette.text.primary
            }}
          >
            Наша команда
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in={true} timeout={1000 + index * 300}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 4,
                      height: '100%',
                      border: 'none',
                      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
                      boxShadow: theme.shadows[2],
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[6]
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar
                        src={member.avatar}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 3,
                          border: `4px solid ${theme.palette.primary.main}`,
                          boxShadow: theme.shadows[4]
                        }}
                      />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="primary.main"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        {member.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {member.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Статистика */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: `${gradientBackground} 8s ease infinite`,
            backgroundSize: '400% 400%'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}
          />
          
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 6, position: 'relative' }}>
            Мы в цифрах
          </Typography>
          
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Fade in={true} timeout={1500 + index * 200}>
                  <Box>
                    <Box sx={{ color: 'white', mb: 2 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      {stat.label}
                    </Typography>
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