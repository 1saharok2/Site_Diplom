import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Fade,
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
import { keyframes } from "@emotion/react";
import "./AboutPage.css";

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AboutPage = () => {
  const theme = useTheme();

  const sectionGap = { xs: 5, md: 7 };
  const sectionTitleSx = {
    fontWeight: 800,
    mb: { xs: 3, md: 4 },
    color: theme.palette.text.primary,
    letterSpacing: "-0.02em",
  };

  const features = [
    {
      icon: <Store sx={{ fontSize: 44 }} />,
      title: "Широкий ассортимент",
      description:
        "Более 1000 товаров различных категорий от проверенных производителей",
    },
    {
      icon: <LocalShipping sx={{ fontSize: 44 }} />,
      title: "Быстрая доставка",
      description: "Доставляем заказы по всей России за 1–3 рабочих дня",
    },
    {
      icon: <Security sx={{ fontSize: 44 }} />,
      title: "Гарантия качества",
      description: "Все товары проходят тщательную проверку перед отправкой",
    },
    {
      icon: <SupportAgent sx={{ fontSize: 44 }} />,
      title: "Поддержка 24/7",
      description: "Наша служба поддержки всегда готова помочь вам",
    },
  ];

  const team = [
    {
      name: "Коробков Иван",
      position: "CEO & Основатель",
      avatar: "https://electronic.tw1.ru/images/3w.jpg",
      description: "Опытный специалист с многолетним стажем в e-commerce",
    },
    {
      name: "Стариков Александр",
      position: "Технический директор",
      avatar: "https://electronic.tw1.ru/images/2w.jpg",
      description: "Профессиональный программист и лидер технической команды",
    },
    {
      name: "Амин Гусейнли",
      position: "Менеджер по продажам",
      avatar: "https://electronic.tw1.ru/images/1w.jpg",
      description: "Эксперт в клиентском сервисе и управлении продажами",
    },
  ];

  const stats = [
    { icon: <People sx={{ fontSize: 30 }} />, value: "10K+", label: "Довольных клиентов" },
    { icon: <Store sx={{ fontSize: 30 }} />, value: "1000+", label: "Товаров в каталоге" },
    { icon: <CalendarToday sx={{ fontSize: 30 }} />, value: "3", label: "Года на рынке" },
    { icon: <AccessTime sx={{ fontSize: 30 }} />, value: "24/7", label: "Поддержка" },
  ];

  const avatarImgProps = {
    loading: "lazy",
    onError: (e) => {
      e.currentTarget.src = `${process.env.PUBLIC_URL || ""}/images/avatar-placeholder.png`;
    },
  };

  return (
    <Box className="about-page-root">
      <Box className="about-hero">
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Zoom in timeout={800}>
            <Box className="about-hero-inner">
              <Typography component="h1" className="about-hero-title">
                О нашем магазине
              </Typography>
              <Typography className="about-hero-sub" variant="h6" component="p">
                Мы создаём будущее розничной торговли, объединяя технологии и безупречный сервис
                для вашего комфорта.
              </Typography>
            </Box>
          </Zoom>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
          pb: { xs: 8, md: 12 },
        }}
      >
        {/* Статистика */}
        <Box
          component="section"
          aria-labelledby="about-stats-heading"
          sx={{ mb: sectionGap, display: "flex", justifyContent: "center" }}
        >
          <Paper
            elevation={0}
            className="about-stats-paper"
            sx={{
              width: "100%",
              maxWidth: 1040,
              mx: "auto",
              p: { xs: 3, sm: 4, md: 5 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
              color: "white",
              borderRadius: 3,
              textAlign: "center",
              animation: `${gradientBackground} 10s ease infinite`,
              backgroundSize: "400% 400%",
            }}
          >
            <Typography
              id="about-stats-heading"
              variant="h4"
              component="h2"
              align="center"
              sx={{ fontWeight: 800, mb: { xs: 3, md: 4 }, width: "100%" }}
            >
              Мы в цифрах
            </Typography>
            <Box className="about-stats-grid">
              {stats.map((stat, index) => (
                <Box key={index} className="about-stats-grid-item">
                  <Fade in timeout={1200 + index * 120}>
                    <Box
                      className="about-stat-cell"
                      sx={{
                        textAlign: "center",
                        py: { xs: 1.5, md: 2 },
                        px: 1,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          color: "white",
                          mb: 1.5,
                          display: "flex",
                          justifyContent: "center",
                          opacity: 0.95,
                        }}
                        aria-hidden
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        component="span"
                        sx={{
                          fontWeight: 800,
                          mb: 0.75,
                          fontSize: { xs: "1.65rem", sm: "2rem", md: "2.125rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          opacity: 0.92,
                          fontWeight: 500,
                          lineHeight: 1.4,
                          maxWidth: 200,
                          mx: "auto",
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* История */}
        <Box
          component="section"
          aria-labelledby="about-history-heading"
          sx={{ mb: sectionGap, display: "flex", justifyContent: "center" }}
        >
          <Fade in timeout={900}>
            <Paper
              className="about-history-paper"
              elevation={0}
              sx={{
                overflow: "hidden",
                width: "100%",
                maxWidth: 1040,
                mx: "auto",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 2.5, md: 3 },
                }}
              >
                <Box sx={{ width: "100%", maxWidth: 640, mx: "auto" }}>
                  <Typography
                    id="about-history-heading"
                    variant="h4"
                    component="h2"
                    className="about-section-title"
                    sx={{ ...sectionTitleSx, textAlign: "center" }}
                  >
                    Наша история
                  </Typography>
                  <Typography className="about-paragraph" paragraph sx={{ mb: 2, textAlign: "center" }}>
                    <strong>TechMarket</strong> был основан в 2020 году тремя друзьями-энтузиастами, которые верили,
                    что онлайн-шопинг должен быть простым, безопасным и доступным для каждого.
                  </Typography>
                  <Typography className="about-paragraph" paragraph sx={{ mb: 0, textAlign: "center" }}>
                    В 2021 году мы заключили партнерские соглашения с ведущими брендами, к 2022 — расширили склад и
                    команду. Сегодня мы обслуживаем более 10 000 клиентов по всей России.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: 720,
                  }}
                >
                  <Chip icon={<EmojiEvents />} label="Лучший магазин 2023" color="primary" variant="outlined" />
                  <Chip icon={<TrendingUp />} label="Рост +200% в год" color="success" variant="outlined" />
                  <Chip icon={<Group />} label="25+ сотрудников" color="secondary" variant="outlined" />
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Box>

        {/* Преимущества */}
        <Box
          component="section"
          aria-labelledby="about-features-heading"
          sx={{ mb: sectionGap, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <Typography
            id="about-features-heading"
            variant="h4"
            component="h2"
            align="center"
            sx={{ ...sectionTitleSx, width: "100%" }}
          >
            Почему выбирают нас
          </Typography>
          <Box className="about-features-grid">
            {features.map((feature) => (
              <Box key={feature.title} className="about-feature-cell">
                <Card
                  className="about-feature-card about-feature-card-inner"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "none",
                    background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                    boxShadow: theme.shadows[1],
                    borderRadius: 3,
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      textAlign: "center",
                      p: { xs: 2.5, md: 3 },
                      minHeight: 268,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 72,
                        height: 72,
                        flexShrink: 0,
                        borderRadius: "50%",
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        minHeight: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.65,
                        flexGrow: 1,
                        maxWidth: 260,
                        mx: "auto",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Команда */}
        <Box
          component="section"
          aria-labelledby="about-team-heading"
          sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <Typography
            id="about-team-heading"
            variant="h4"
            component="h2"
            align="center"
            className="about-section-title"
            sx={{ ...sectionTitleSx, width: "100%" }}
          >
            Наша команда
          </Typography>
          <Box className="about-team-grid">
            {team.map((m, i) => (
              <Box key={m.name} className="about-team-cell">
                <Fade in timeout={700 + i * 120}>
                  <Card
                    className="team-card"
                    elevation={0}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: "center",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: { xs: 3, md: 3 },
                        px: { xs: 2, md: 2.5 },
                      }}
                    >
                      <Avatar
                        src={m.avatar}
                        alt={m.name}
                        imgProps={avatarImgProps}
                        sx={{
                          width: 100,
                          height: 100,
                          mb: 2,
                          border: `3px solid ${theme.palette.primary.main}`,
                        }}
                      />
                      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
                        {m.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ fontWeight: 600, mb: 1, mt: 0.5 }}
                      >
                        {m.position}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.65, maxWidth: 320, mx: "auto" }}
                      >
                        {m.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
