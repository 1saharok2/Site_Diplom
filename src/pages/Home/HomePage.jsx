import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Fab,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Stack,
  Fade,
  Grow,
  Zoom,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  KeyboardArrowUp,
  ShoppingBasket,
  Category,
  LocalShipping,
  Security,
  SupportAgent,
  ChevronLeft,
  ChevronRight,
  Star,
  FlashOn,
  NewReleases,
  Discount,
  Visibility,
  FavoriteBorder,
  CompareArrows,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-coverflow";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductsContext";

const HomePage = () => {
  const { addToCart } = useCart();
  const { products, categories, loading, error, refreshData } = useProducts();
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // === Загрузка продуктов для карусели ===
  useEffect(() => {
    if (products.length > 0) {
      const carouselItems = products
        .filter((product) => {
          const hasImages = 
            (Array.isArray(product.images) && product.images.length > 0) ||
            (Array.isArray(product.image_url) && product.image_url.length > 0) ||
            (typeof product.image_url === 'string' && product.image_url.trim() !== '');
          return product.rating >= 4.0 && hasImages;
        })
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
      setCarouselProducts(
        carouselItems.length > 0 ? carouselItems : products.slice(0, 4)
      );
    }
  }, [products]);

  // === Формирование ссылок на изображения ===
  const getImageUrl = (imageUrl) => {
    if (typeof imageUrl !== "string") return "https://electronic.tw1.ru/images/placeholder.jpg";
    imageUrl = imageUrl.trim();
    if (!imageUrl || imageUrl === "null" || imageUrl === "undefined") {
      return "https://electronic.tw1.ru/images/placeholder.jpg";
    }
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/")) return `https://electronic.tw1.ru${imageUrl}`;
    return `https://electronic.tw1.ru/images/${imageUrl}`;
  };

  const getProductImage = (product) => {
    if (!product) return "https://electronic.tw1.ru/images/placeholder.jpg";
    
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") {
        return getImageUrl(firstImage);
      }
    }
    
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
      const firstImage = product.image_url[0];
      if (typeof firstImage === "string") {
        return getImageUrl(firstImage);
      }
    }
    
    if (typeof product.image_url === "string" && product.image_url.trim() !== "") {
      return getImageUrl(product.image_url);
    }
    
    return "https://electronic.tw1.ru/images/placeholder.jpg";
  };

  const getCategoryImage = (category) => {
    if (!category) return "https://electronic.tw1.ru/images/placeholder.jpg";
    if (category.image_url && typeof category.image_url === "string") {
      return getImageUrl(category.image_url);
    }
    return "https://electronic.tw1.ru/images/placeholder.jpg";
  };

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  const calculateDiscount = (price, oldPrice) => {
    if (!oldPrice || !price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={refreshData}>
              Обновить
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );

  const features = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Гарантия качества",
      description: "14 дней на возврат товара",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: "Поддержка 24/7",
      description: "Всегда готовы помочь",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: <ShoppingBasket sx={{ fontSize: 40 }} />,
      title: "Широкий ассортимент",
      description: `Более ${products.length} товаров`,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      {/* === УЛУЧШЕННАЯ КАРУСЕЛЬ === */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Фоновый градиент */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
            zIndex: 0,
          }}
        />
        
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              return `<span class="${className}" style="width: 12px; height: 12px; margin: 0 6px; background: ${index === activeIndex ? theme.palette.primary.main : '#ccc'}; border-radius: 50%; transition: all 0.3s;"></span>`;
            },
          }}
          autoplay={{ 
            delay: 5000,
            disableOnInteraction: false,
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          speed={800}
          onSlideChange={handleSlideChange}
          style={{
            width: "100%",
            height: "auto", // Меняем фиксированную высоту на auto
            minHeight: isMobile ? "60vh" : "85vh", // Добавляем минимальную высоту
            position: "relative",
            zIndex: 1,
            overflow: "hidden", // Важно: скрываем переполнение
          }}
          slidesOffsetBefore={16}
          slidesOffsetAfter={16}
          slidesPerView={1}
          spaceBetween={32}
        >
          {carouselProducts.map((product, index) => {
            const discount = calculateDiscount(product.price, product.old_price);
            
            return (
              <SwiperSlide key={product.id}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 3, md: 6, lg: 9, xl: 12 },
                    py: { xs: 3, md: 0 }, // Уменьшаем отступы сверху/снизу на мобильных
                    height: '100%',
                    minHeight: { xs: "60vh", md: "85vh" }, // Минимальная высота слайда
                    gap: { xs: 2, md: 6 }, // Уменьшаем gap на мобильных
                    overflow: "hidden", // Предотвращаем выход за пределы
                  }}
                >
                  {/* Левая часть — текст с анимацией */}
                  <Box 
                    sx={{ 
                      flex: { xs: 0, md: 1 }, // На мобильных не растягиваем
                      textAlign: { xs: "center", md: "left" },
                      animation: 'fadeInLeft 0.8s ease-out',
                      px: { xs: 1, sm: 2, md: 3 },
                      width: { xs: "100%", md: "auto" },
                      order: { xs: 2, md: 1 }, // Меняем порядок на мобильных: текст снизу
                      mt: { xs: 2, md: 0 }, // Отступ сверху на мобильных
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ 
                      mb: 2, 
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      {product.rating >= 4.5 && (
                        <Chip
                          icon={<FlashOn />}
                          label="ТОП ПРОДАЖ"
                          color="error"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      )}
                      <Chip
                        icon={<NewReleases />}
                        label="НОВИНКА"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Stack>
                    
                    <Typography
                      variant="h3"
                      sx={{ 
                        fontWeight: 800, 
                        mb: 1, // Уменьшаем отступ
                        lineHeight: 1.2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2.5rem', lg: '3rem' }
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 2, // Уменьшаем отступ
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                        color: 'text.secondary',
                        maxWidth: '600px',
                        display: { xs: 'none', sm: 'block' } // Скрываем на очень маленьких экранах
                      }}
                    >
                      {product.description?.substring(0, 120) ||
                        "Инновационные технологии и премиум качество по доступной цене"}
                      ...
                    </Typography>

                    {/* Рейтинг */}
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1, 
                      mb: 2,
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}>
                      <Rating 
                        value={product.rating || 4.5} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                        icon={<Star sx={{ 
                          color: '#FFD700',
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }} />}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({product.rating || 4.5})
                      </Typography>
                    </Box>

                    {/* Цена */}
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 2, // Уменьшаем gap
                      mb: 3,
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}>
                      <Typography
                        variant="h3"
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.primary.main,
                          fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.5rem' }
                        }}
                      >
                        {product.price?.toLocaleString("ru-RU")} ₽
                      </Typography>
                    </Box>

                    {/* Кнопки действий */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1.5} // Уменьшаем spacing
                      sx={{ 
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        mb: 2,
                        width: '100%'
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingBasket />}
                        onClick={() => addToCart(product.id, 1)}
                        sx={{
                          px: { xs: 3, sm: 4 },
                          py: 1,
                          borderRadius: '50px',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 600,
                          boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)',
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        В КОРЗИНУ
                      </Button>
                      
                      <Button
                        component={Link}
                        to={`/product/${product.id}`}
                        variant="outlined"
                        color="primary"
                        sx={{ 
                          px: { xs: 3, sm: 4 },
                          py: 1,
                          borderRadius: '50px',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 600,
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        <Visibility sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        ПОДРОБНЕЕ
                      </Button>
                    </Stack>
                  </Box>

                  {/* Правая часть — изображение с эффектом */}
                  <Box
                    sx={{
                      flex: { xs: 0, md: 1 }, // На мобильных не растягиваем
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: 'relative',
                      animation: 'fadeInRight 0.8s ease-out',
                      px: { xs: 1, sm: 2, md: 3 },
                      width: { xs: "100%", md: "auto" },
                      height: { xs: "200px", sm: "250px", md: "auto" }, // Фиксируем высоту на мобильных
                      maxWidth: { xs: "100%", md: "100%" },
                      maxHeight: { xs: "250px", md: "none" }, // Ограничиваем максимальную высоту
                      order: { xs: 1, md: 2 }, // Меняем порядок на мобильных: изображение сверху
                      mb: { xs: 1, md: 0 }, // Отступ снизу на мобильных
                    }}
                  >
                    {/* Декоративный элемент - уменьшаем на мобильных */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: { xs: '200px', sm: '300px', md: '400px' },
                        height: { xs: '200px', sm: '300px', md: '400px' },
                        background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0,
                      }}
                    />
                    
                    <Box
                      component="img"
                      src={getProductImage(product)}
                      alt={product.name}
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: "auto", // Меняем на auto
                        height: "100%", // Занимаем всю высоту контейнера
                        maxWidth: { xs: "80%", sm: "70%", md: "100%" },
                        maxHeight: { xs: "180px", sm: "220px", md: "400px", lg: "450px" },
                        borderRadius: { xs: 2, md: 4 },
                        boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)',
                        transform: { xs: 'none', md: 'perspective(1000px) rotateY(-5deg)' },
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: { xs: 'scale(1.02)', md: 'perspective(1000px) rotateY(0deg) scale(1.02)' },
                        },
                        objectFit: 'contain', // Важно: сохраняем пропорции
                        backgroundColor: 'white',
                        p: { xs: 1, md: 2 },
                      }}
                    />
                  </Box>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* === Кастомные кнопки навигации === */}
        <IconButton
          className="swiper-button-prev-custom"
          sx={{
            position: "absolute",
            top: "50%",
            left: { xs: 10, md: 30 },
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            color: theme.palette.primary.main,
            width: 56,
            height: 56,
            "&:hover": { 
              backgroundColor: "white",
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              transform: 'translateY(-50%) scale(1.1)'
            },
            zIndex: 10,
            transition: 'all 0.3s',
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>

        <IconButton
          className="swiper-button-next-custom"
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: 10, md: 30 },
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            color: theme.palette.primary.main,
            width: 56,
            height: 56,
            "&:hover": { 
              backgroundColor: "white",
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              transform: 'translateY(-50%) scale(1.1)'
            },
            zIndex: 10,
            transition: 'all 0.3s',
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <ChevronRight fontSize="large" />
        </IconButton>
      </Box>

      {/* Анимации */}
      <style>
        {`
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(255, 64, 129, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 64, 129, 0);
            }
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>

      {/* === БЛОК "ПОЧЕМУ ВЫБИРАЮТ НАС" === */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{ 
            fontWeight: 800, 
            mb: 6, 
            fontSize: { xs: "2rem", md: "2.5rem" },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
            }
          }}
        >
          Почему выбирают нас
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Grow in timeout={500 + i * 100}>
                <Card
                  sx={{
                    textAlign: "center",
                    p: 3,
                    borderRadius: 3,
                    transition: "0.4s",
                    height: '100%',
                    border: '1px solid transparent',
                    background: 'white',
                    "&:hover": { 
                      transform: "translateY(-10px)", 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      background: f.gradient,
                      color: 'white',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(10deg)',
                      }
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* === КАТЕГОРИИ === */}
      <Box sx={{ py: 8, bgcolor: "grey.50", position: 'relative' }}>
        {/* Декоративный элемент */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(102,126,234,0.05) 0%, rgba(102,126,234,0) 70%)',
            borderRadius: '50%',
          }}
        />
        
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            align="center"
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              fontSize: { xs: "2rem", md: "2.5rem" },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Популярные категории
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            Выберите категорию и откройте для себя лучшие товары
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {categories.slice(0, 4).map((cat, index) => (
              <Grid item xs={12} sm={6} md={3} key={cat.id}>
                <Zoom in timeout={500 + index * 100}>
                  <Box
                    component={Link}
                    to={`/catalog/${cat.slug || cat.id}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "0.4s",
                      height: '100%',
                      display: 'block',
                      "&:hover": { 
                        transform: "translateY(-10px)", 
                        boxShadow: '0 25px 50px -12px rgba(102, 126, 234, 0.25)',
                        '& .category-image': {
                          transform: 'scale(1.1)',
                        },
                        '& .category-content': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                        }
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                      <Box
                        component="img"
                        className="category-image"
                        src={getCategoryImage(cat)}
                        alt={cat.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)',
                        }}
                      />
                    </Box>
                    <Box 
                      className="category-content"
                      sx={{ 
                        textAlign: "center", 
                        p: 3,
                        backgroundColor: 'white',
                        transition: 'all 0.3s',
                      }}
                    >
                      <Category sx={{ 
                        color: theme.palette.primary.main, 
                        fontSize: 40, 
                        mb: 2,
                        transition: 'color 0.3s',
                      }} />
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {cat.name}
                      </Typography>
                      <Typography variant="body2" mb={2} sx={{ minHeight: 40 }}>
                        {cat.description?.substring(0, 60) || "Лучшие товары категории"}...
                      </Typography>
                      <Chip
                        label={`${cat.product_count || 0} товаров`}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600,
                          transition: 'all 0.3s',
                        }}
                      />
                    </Box>
                  </Box>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* === КНОПКА "НАВЕРХ" === */}
      <Fab
        onClick={scrollToTop}
        size="medium"
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: "white",
          width: 56,
          height: 56,
          "&:hover": { 
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          },
          transition: 'all 0.3s',
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default HomePage;