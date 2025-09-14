import React, { useState } from 'react';
import './ProductPage_css/ProductTabs.css';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Описание' },
    { id: 'specifications', label: 'Характеристики' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'delivery', label: 'Доставка и оплата' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="tab-content">
            <h3>Описание товара</h3>
            <p>{product.description || 'Описание товара скоро появится...'}</p>
            {product.features && (
              <div className="features-list">
                <h4>Ключевые особенности:</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'specifications':
        return (
          <div className="tab-content">
            <h3>Технические характеристики</h3>
            {product.specifications ? (
              <div className="specifications-table">
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-name">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Характеристики товара скоро будут добавлены...</p>
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="tab-content">
            <h3>Отзывы покупателей</h3>
            <div className="reviews-summary">
              <div className="rating-overview">
                <span className="average-rating">{product.rating || 0}</span>
                <span className="rating-stars">★★★★★</span>
                <span className="reviews-count">{product.reviewsCount || 0} отзывов</span>
              </div>
            </div>
            <div className="reviews-list">
              <p>Отзывы будут доступны после покупки товара</p>
            </div>
          </div>
        );

      case 'delivery':
        return (
          <div className="tab-content">
            <h3>Доставка и оплата</h3>
            <div className="delivery-info">
              <div className="info-item">
                <h4>🚚 Доставка</h4>
                <ul>
                  <li>Курьерская доставка по городу - 1-2 дня</li>
                  <li>Самовывоз из пункта выдачи - бесплатно</li>
                  <li>Почтовая доставка по России - 3-7 дней</li>
                </ul>
              </div>
              <div className="info-item">
                <h4>💳 Оплата</h4>
                <ul>
                  <li>Наличными при получении</li>
                  <li>Банковской картой онлайн</li>
                  <li>Рассрочка и кредит</li>
                </ul>
              </div>
              <div className="info-item">
                <h4>🔄 Возврат</h4>
                <p>Возврат товара в течение 14 дней без объяснения причин</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="product-tabs">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tabs-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductTabs;