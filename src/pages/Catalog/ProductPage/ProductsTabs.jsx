import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './ProductPage_css/ProductTabs.css';

const ProductTabs = ({ product }) => {
  return (
    <Tabs defaultActiveKey="description" className="product-tabs">
      <Tab eventKey="description" title="Описание">
        <div className="tab-content">
          <h4>Подробное описание</h4>
          <p>{product.fullDescription || product.description}</p>
        </div>
      </Tab>
      
      <Tab eventKey="specifications" title="Характеристики">
        <div className="tab-content">
          <h4>Технические характеристики</h4>
          <div className="specs-table">
            <div className="spec-row">
              <span className="spec-name">Категория:</span>
              <span className="spec-value">{product.category}</span>
            </div>
            <div className="spec-row">
              <span className="spec-name">Рейтинг:</span>
              <span className="spec-value">{product.rating}/5</span>
            </div>
            <div className="spec-row">
              <span className="spec-name">Отзывы:</span>
              <span className="spec-value">{product.reviewsCount}</span>
            </div>
            <div className="spec-row">
              <span className="spec-name">Артикул:</span>
              <span className="spec-value">#{product.id}</span>
            </div>
          </div>
        </div>
      </Tab>

      <Tab eventKey="reviews" title="Отзывы">
        <div className="tab-content">
          <h4>Отзывы покупателей</h4>
          {product.reviewsCount > 0 ? (
            <p>Система отзывов будет реализована позже</p>
          ) : (
            <p>Пока нет отзывов об этом товаре</p>
          )}
        </div>
      </Tab>
    </Tabs>
  );
};

export default ProductTabs;