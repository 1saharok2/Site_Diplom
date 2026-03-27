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
      description: `Более 90 товаров`,
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
            height: "auto", 
            minHeight: isMobile ? "40vh" : "55vh", 
            position: "relative",
            zIndex: 1,
            overflow: "hidden", 
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
                    px: { xs: 2, md: 4, lg: 6 }, 
                    py: { xs: 2, md: 3 }, 
                    height: '100%',
                    minHeight: { xs: "40vh", md: "55vh" }, 
                    gap: { xs: 1, md: 4 }, 
                    overflow: "hidden",
                  }}
                >
                  {/* Левая часть — текст с анимацией */}
                  <Box 
                    sx={{ 
                      flex: { xs: 0, md: 1 },
                      textAlign: { xs: "center", md: "left" },
                      animation: 'fadeInLeft 0.8s ease-out',
                      px: { xs: 1, sm: 1.5, md: 2 },
                      pl: { md: 6, lg: 8 }, 
                      width: { xs: "100%", md: "auto" },
                      order: { xs: 2, md: 1 },
                      mt: { xs: 1, md: 0 },
                      maxWidth: { md: '60%', lg: '50%' }, 
                    }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ 
                      mb: 1, 
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      {product.rating >= 4.5 && (
                        <Chip
                          icon={<FlashOn />}
                          label="ТОП ПРОДАЖ"
                          color="error"
                          size="small"
                          sx={{ fontWeight: "bold", height: '24px' }} 
                        />
                      )}
                      <Chip
                        icon={<NewReleases />}
                        label="НОВИНКА"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "bold", height: '24px' }} 
                      />
                    </Stack>
                    
                    <Typography
                      variant="h3"
                      sx={{ 
                        fontWeight: 800, 
                        mb: 0.5, 
                        lineHeight: 1.2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '2.2rem', lg: '2.5rem' } 
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 1.5, 
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.95rem' }, 
                        color: 'text.secondary',
                        maxWidth: '550px',
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {product.description?.substring(0, 100) || 
                        "Инновационные технологии и премиум качество по доступной цене"}
                      ...
                    </Typography>

                    {/* Цена */}
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1.5, 
                      mb: 2, 
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}>
                      <Typography
                        variant="h3"
                        sx={{ 
                          fontWeight: 800, 
                          color: theme.palette.primary.main,
                          fontSize: { xs: '1.5rem', sm: '1.7rem', md: '2.2rem' } 
                        }}
                      >
                        {product.price?.toLocaleString("ru-RU")} ₽
                      </Typography>
                    </Box>

                    {/* Кнопки действий */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1} 
                      sx={{ 
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        mb: 1, 
                        width: '100%'
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ShoppingBasket />}
                        onClick={() => addToCart(product.id, 1)}
                        sx={{
                          px: { xs: 2.5, sm: 3 }, 
                          py: 0.75, 
                          borderRadius: '50px',
                          fontSize: { xs: '0.85rem', sm: '0.95rem' }, 
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
                          px: { xs: 2.5, sm: 3 }, 
                          py: 0.75, 
                          borderRadius: '50px',
                          fontSize: { xs: '0.85rem', sm: '0.95rem' }, 
                          fontWeight: 600,
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        <Visibility sx={{ mr: 0.75, fontSize: { xs: '0.95rem', sm: '1.1rem' } }} />
                        ПОДРОБНЕЕ
                      </Button>
                    </Stack>
                  </Box>

                  {/* Правая часть — изображение с эффектом */}
                  <Box
                    sx={{
                      flex: { xs: 0, md: 1 },
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: 'relative',
                      animation: 'fadeInRight 0.8s ease-out',
                      px: { xs: 0.5, sm: 1, md: 1.5 }, 
                      width: { xs: "100%", md: "auto" },
                      height: { xs: "200px", sm: "250px", md: "auto" }, 
                      maxWidth: { xs: "100%", md: "100%" },
                      maxHeight: { xs: "200px", md: "none" }, 
                      order: { xs: 1, md: 2 },
                      mb: { xs: 0.5, md: 0 }, 
                    }}
                  >
                    {/* Декоративный элемент - уменьшен */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: { xs: '150px', sm: '250px', md: '350px' }, 
                        height: { xs: '150px', sm: '250px', md: '350px' }, 
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
                        width: "auto",
                        height: "100%",
                        maxWidth: { xs: "70%", sm: "60%", md: "90%" }, 
                        maxHeight: { xs: "150px", sm: "200px", md: "370px", lg: "400px" }, 
                        borderRadius: { xs: 2, md: 3 },
                        boxShadow: '0 10px 25px -8px rgba(0, 0, 0, 0.15)', 
                        transform: { xs: 'none', md: 'perspective(1000px) rotateY(-3deg)' }, 
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: { xs: 'scale(1.02)', md: 'perspective(1000px) rotateY(0deg) scale(1.02)' },
                        },
                        objectFit: 'contain',
                        backgroundColor: 'white',
                        p: { xs: 0.5, md: 1 }, 
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

      {/* === КАТЕГОРИИ === */}
      <Box sx={{ py: 8, bgcolor: "white", position: 'relative' }}>
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

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 3,
              mx: 'auto',
            }}
          >
            {categories.slice(0, 4).map((cat, index) => (
              <Box
                key={cat.id}
                sx={{
                  flex: { xs: '0 0 calc(100% - 32px)', sm: '0 0 calc(50% - 24px)', md: '0 0 calc(25% - 24px)' },
                  maxWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' },
                  minWidth: { xs: '280px', sm: 'auto' },
                }}
              >
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
                      width: '100%',
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
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

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
              background: 'white',
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