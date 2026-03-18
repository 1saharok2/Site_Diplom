import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import ProductCard from '../components/Products/ProductCard/ProductCard'

const PersonalizedRecommendations = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser) return; // для неавторизованных не показываем персонализированные
      setLoading(true);
      try {
        // Можно передавать текущий товар, чтобы исключить его из рекомендаций
        const params = { userId: currentUser.id };
        if (currentProductId) params.exclude = currentProductId;
        const response = await apiService.get('/api/recommendations.php', params);
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
  }, [currentUser, currentProductId]);

  if (!currentUser || loading || products.length === 0) return null;

  return (
    <div className="recommendations-section">
      <h3>Рекомендуем вам</h3>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;