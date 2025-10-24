import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductsContext";

const HomePage = () => {
  const { addToCart } = useCart();
  const { products, categories, loading, error, refreshData } = useProducts();
  const [carouselProducts, setCarouselProducts] = useState([]);

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
        .slice(0, 6);
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
    
    // Проверяем массив images (новый формат)
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") {
        return getImageUrl(firstImage);
      }
    }
    
    // Проверяем массив image_url (старый формат)
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
      const firstImage = product.image_url[0];
      if (typeof firstImage === "string") {
        return getImageUrl(firstImage);
      }
    }
    
    // Проверяем строку image_url
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

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: "Бесплатная доставка",
      description: "При заказе от 3000 рублей",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Гарантия качества",
      description: "14 дней на возврат товара",
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: "Поддержка 24/7",
      description: "Всегда готовы помочь",
    },
    {
      icon: <ShoppingBasket sx={{ fontSize: 40 }} />,
      title: "Широкий ассортимент",
      description: `Более ${products.length} товаров`,
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      {/* === КАРУСЕЛЬ === */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          el: ".custom-pagination",
        }}
        autoplay={{ delay: 5000 }}
        loop
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {carouselProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                px: { xs: 2, md: 8 },
                py: { xs: 4, md: 10 },
                background: "linear-gradient(135deg, #5c6bc0, #512da8)",
                color: "white",
                minHeight: { xs: "auto", md: "70vh" },
                gap: { xs: 3, md: 6 },
                borderRadius: 3,
                position: "relative",
              }}
            >
              {/* Левая часть — текст */}
              <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                <Chip
                  label="ХИТ ПРОДАЖ"
                  color="secondary"
                  sx={{ mb: 2, fontWeight: "bold" }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}
                >
                  {product.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {product.description?.substring(0, 120) ||
                    "Премиум качество по доступной цене"}
                  ...
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#f48fb1" }}
                  >
                    {product.price?.toLocaleString("ru-RU")} ₽
                  </Typography>
                  {product.old_price && (
                    <Typography
                      variant="body1"
                      sx={{ textDecoration: "line-through", opacity: 0.7 }}
                    >
                      {product.old_price?.toLocaleString("ru-RU")} ₽
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingBasket />}
                    onClick={() => addToCart(product.id, 1)}
                  >
                    В КОРЗИНУ
                  </Button>
                  <Button
                    component={Link}
                    to={`/product/${product.id}`}
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    ПОДРОБНЕЕ
                  </Button>
                </Box>
              </Box>

              {/* Правая часть — изображение */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={getProductImage(product)}
                  alt={product.name}
                  sx={{
                    maxWidth: { xs: "80%", md: "90%" },
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                />
              </Box>
            </Box>
          </SwiperSlide>
        ))}

        {/* === Кнопки навигации === */}
        <IconButton
          className="swiper-button-prev"
          sx={{
            position: "absolute",
            top: "50%",
            left: 20,
            transform: "translateY(-50%)",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
            zIndex: 10,
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          className="swiper-button-next"
          sx={{
            position: "absolute",
            top: "50%",
            right: 20,
            transform: "translateY(-50%)",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.4)" },
            zIndex: 10,
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* === Точки пагинации === */}
        <Box
          className="custom-pagination"
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        />
      </Swiper>


      {/* === БЛОК "ПОЧЕМУ ВЫБИРАЮТ НАС" === */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{ fontWeight: 700, mb: 6, fontSize: { xs: "2rem", md: "2.5rem" } }}
        >
          Почему выбирают нас
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 3 },
                }}
              >
                <Box sx={{ color: "primary.main", mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* === КАТЕГОРИИ === */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container>
          <Typography
            variant="h2"
            align="center"
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: "2rem", md: "2.5rem" } }}
          >
            Популярные категории
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            Выберите категорию и откройте для себя лучшие товары
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {categories.slice(0, 4).map((cat) => (
              <Grid item xs={12} sm={6} md={3} key={cat.id}>
                <Box
                  component={Link}
                  to={`/catalog?category=${cat.slug || cat.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-5px)", boxShadow: 4 },
                  }}
                >
                  <Box
                    component="img"
                    src={getCategoryImage(cat)}
                    alt={cat.name}
                    sx={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderBottom: "2px solid #eee",
                    }}
                  />
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Category sx={{ color: "primary.main", fontSize: 32, mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {cat.description || "Описание категории"}
                    </Typography>
                    <Chip
                      label={`${cat.product_count || 0} товаров`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
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
          bottom: 24,
          right: 24,
          bgcolor: "primary.main",
          color: "white",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default HomePage;
