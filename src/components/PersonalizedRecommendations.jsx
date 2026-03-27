import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import ProductCard from '../components/Products/ProductCard/ProductCard'
import './PersonalizedRecommendations.css';

const PersonalizedRecommendations = ({ currentProductId, limit = 16 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // apiService.get не принимает "params" вторым аргументом — формируем query-string явно
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
      <h3 className="recommendations-title">
        {currentUser ? 'Рекомендуем вам' : 'Популярные товары'}
      </h3>
      <div className="recommendations-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;