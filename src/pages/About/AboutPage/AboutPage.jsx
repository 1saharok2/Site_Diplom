import React from "react";
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
  Chip,
} from "@mui/material";
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
  Group,
} from "@mui/icons-material";
import { keyframes } from '@emotion/react';
import "./AboutPage.css";

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
      title: "Широкий ассортимент",
      description:
        "Более 1000 товаров различных категорий от проверенных производителей",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 48 }} />,
      title: "Быстрая доставка",
      description: "Доставляем заказы по всей России за 1–3 рабочих дня",
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: "Гарантия качества",
      description: "Все товары проходят тщательную проверку перед отправкой",
    },
    {
      icon: <SupportAgent sx={{ fontSize: 48 }} />,
      title: "Поддержка 24/7",
      description: "Наша служба поддержки всегда готова помочь вам",
    },
  ];

  // team avatars are raw URLs (as you said)
  const team = [
    {
      name: "Коробков Иван",
      position: "CEO & Основатель",
      avatar:
        "https://sun9-27.userapi.com/s/v1/ig2/ShNjTKtflQCrq_Zw2hmhz4pDaTPPcuwlLvH0n51gN9xEmdJ0QCpmj7osgiZUYLKA8qIp7jQh_-Jhq_FKxffWJQQY.jpg?quality=95",
      description: "Опытный специалист с многолетним стажем в e-commerce",
    },
    {
      name: "Стариков Александр",
      position: "Технический директор",
      avatar:
        "https://sun9-16.userapi.com/s/v1/ig2/0IVJKFRSbnfYlSUUKbup5iRSWByxpV8PsnFBGZC4Ic6X5U3TU5j7ftsszpdNRDaMElKAdYZFL6FWW1X2XfEXUdq2.jpg?quality=95",
      description: "Профессиональный программист и лидер технической команды",
    },
    {
      name: "Амин Гусейнли",
      position: "Менеджер по продажам",
      avatar:
        "https://sun9-69.userapi.com/s/v1/ig2/SZzuY37sbGi3NhpwAfQidMWHFSMr1c9IV5fnt-L7gY4oUZm__Mlqtwz_H1blJ5G6AlOiWYuJ1IViHWaa4IwpaeC7.jpg?quality=95",
      description: "Эксперт в клиентском сервисе и управлении продажами",
    },
  ];

  const stats = [
    { icon: <People sx={{ fontSize: 32 }} />, value: "10K+", label: "Довольных клиентов" },
    { icon: <Store sx={{ fontSize: 32 }} />, value: "1000+", label: "Товаров в каталоге" },
    { icon: <CalendarToday sx={{ fontSize: 32 }} />, value: "3", label: "Года на рынке" },
    { icon: <AccessTime sx={{ fontSize: 32 }} />, value: "24/7", label: "Поддержка" },
  ];

  // helper for avatar fallback via imgProps on Avatar
  const avatarImgProps = {
    loading: "lazy",
    onError: (e) => {
      // fallback to placeholder in public/images
      e.currentTarget.src = `${process.env.PUBLIC_URL || ""}/images/avatar-placeholder.png`;
    },
  };

  return (
    <Box className="about-page-root">
      {/* HERO */}
      <Box className="about-hero">
        <Container maxWidth="md">
          <Zoom in timeout={800}>
            <Box className="about-hero-inner">
              <Typography component="h1" className="about-hero-title">
                О нашем магазине
              </Typography>
              <Typography className="about-hero-sub" variant="h6">
                Мы создаём будущее розничной торговли, объединяя технологии и безупречный сервис
                для вашего комфорта.
              </Typography>
            </Box>
          </Zoom>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: { xs: 8, md: 12 } }}>
        {/* History / story block */}
        <Fade in timeout={900}>
          <Paper className="about-history-paper" elevation={0}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" className="about-section-title">
                  Наша история
                </Typography>
                <Typography className="about-paragraph" paragraph>
                  <strong>TechMarket</strong> был основан в 2020 году тремя друзьями-энтузиастами, которые верили,
                  что онлайн-шопинг должен быть простым, безопасным и доступным для каждого.
                </Typography>
                <Typography className="about-paragraph" paragraph>
                  В 2021 году мы заключили партнерские соглашения с ведущими брендами, к 2022 — расширили склад
                  и команду. Сегодня мы обслуживаем более 10 000 клиентов по всей России.
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                  <Chip icon={<EmojiEvents />} label="Лучший магазин 2023" color="primary" variant="outlined" />
                  <Chip icon={<TrendingUp />} label="Рост +200% в год" color="success" variant="outlined" />
                  <Chip icon={<Group />} label="25+ сотрудников" color="secondary" variant="outlined" />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className="about-history-image" role="img" aria-label="История компании" />
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Why choose us */}
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
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Slide direction="up" in={true} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        className="feature-icon"
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mb: 3,
                          mx: 'auto'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
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

        {/* Team */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Typography variant="h3" align="center" className="about-section-title">
            Наша команда
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center">
            {team.map((m, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Fade in timeout={800 + i * 200}>
                  <Card className="team-card" elevation={0}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Avatar
                        src={m.avatar}
                        alt={m.name}
                        imgProps={avatarImgProps}
                        sx={{
                          width: { xs: 86, sm: 100, md: 120 },
                          height: { xs: 86, sm: 100, md: 120 },
                          mx: "auto",
                          mb: 2,
                          border: `3px solid ${theme.palette.primary.main}`,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {m.name}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                        {m.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              borderRadius: 4,
              textAlign: 'center',
              animation: `${gradientBackground} 8s ease infinite`,
              backgroundSize: '400% 400%',
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 6 }}>
              Мы в цифрах
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Fade in={true} timeout={1500 + index * 200}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: 'white', mb: 2, display: 'flex', justifyContent: 'center' }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 400 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;