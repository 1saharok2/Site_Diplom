import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import ProductCard from './Products/ProductCard/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import './PersonalizedRecommendations.css';

const PersonalizedRecommendations = ({ currentProductId, limit = 16 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (currentUser?.id) qs.set('userId', String(currentUser.id));
        if (currentProductId) qs.set('exclude', String(currentProductId));
        qs.set('limit', String(limit));

        const response = await apiService.get(`/recommendations.php?${qs.toString()}`);
        if (response.success) {
          setProducts(response.items);
        }
      } catch (error) {
        console.error('Failed to load recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, currentProductId, limit]);

  if (loading || products.length === 0) return null;

  return (
    <div className="recommendations-section">
      <div className="recommendations-head">
        <h3 className="recommendations-title">
          {currentUser ? 'Рекомендуем вам' : 'Популярные товары'}
        </h3>
        <div className="recommendations-nav-buttons">
          <button
            ref={prevRef}
            type="button"
            className="recommendations-nav-btn"
            aria-label="Предыдущие товары"
          >
            <IoChevronBack aria-hidden />
          </button>
          <button
            ref={nextRef}
            type="button"
            className="recommendations-nav-btn"
            aria-label="Следующие товары"
          >
            <IoChevronForward aria-hidden />
          </button>
        </div>
      </div>

      <div className="recommendations-slider-wrap">
        <Swiper
          className="recommendations-swiper"
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            const nav = swiper.params.navigation;
            if (nav && typeof nav === 'object') {
              nav.prevEl = prevRef.current;
              nav.nextEl = nextRef.current;
            }
          }}
          onSwiper={(swiper) => {
            swiper.navigation?.init();
            swiper.navigation?.update();
          }}
          spaceBetween={16}
          slidesPerView={1.15}
          watchOverflow
          grabCursor
          breakpoints={{
            576: { slidesPerView: 2, spaceBetween: 12 },
            992: { slidesPerView: 3, spaceBetween: 16 },
            1200: { slidesPerView: 4, spaceBetween: 16 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="recommendations-slide">
              <div className="recommendations-slide-inner">
                <ProductCard product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;
