import React, { useState } from 'react';
import { Row, Col, Alert, Container } from 'react-bootstrap';
import ReviewList from '../../../components/Reviews/ReviewList';
import './ProductPage_css/ProductTabs.css';

const ProductTabs = ({ 
  product, 
  reviews = [],           
  reviewsLoading = false, 
  onWriteReview,          
  hasUserReviewed,        
  isAuthenticated         
}) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', title: 'Описание' },
    { id: 'specifications', title: 'Характеристики' },
    { id: 'reviews', title: 'Отзывы' },
    { id: 'delivery', title: 'Доставка и оплата' }
  ];

  // Функция для определения типа товара
  const determineProductType = (product) => {
    if (!product) return 'unknown';
    
    // Определяем тип по категории, названию или другим признакам
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    
    if (category.includes('phone') || category.includes('смартфон') || 
        name.includes('iphone') || name.includes('samsung') || name.includes('xiaomi') ||
        name.includes('pixel') || name.includes('huawei') || name.includes('oppo') ||
        description.includes('смартфон') || description.includes('телефон')) {
      return 'phone';
    }
    
    if (category.includes('tv') || category.includes('телевизор') || 
        name.includes('tv') || name.includes('телевизор') || name.includes('smart tv') ||
        description.includes('телевизор') || description.includes('телевизор')) {
      return 'tv';
    }
    
    if (category.includes('laptop') || category.includes('ноутбук') || 
        name.includes('macbook') || name.includes('asus') || name.includes('lenovo') ||
        name.includes('ноутбук') || description.includes('ноутбук')) {
      return 'laptop';
    }
    
    if (category.includes('tablet') || category.includes('планшет') || 
        name.includes('ipad') || name.includes('планшет') || description.includes('планшет')) {
      return 'tablet';
    }
    
    if (category.includes('headphone') || category.includes('наушник') || 
        name.includes('airpods') || name.includes('наушники') || description.includes('наушники')) {
      return 'headphones';
    }
    
    return 'unknown';
  };

  // Функция для парсинга характеристик
  const parseSpecifications = () => {
    if (!product?.specifications) return {};
    
    try {
      if (typeof product.specifications === 'string') {
        return JSON.parse(product.specifications);
      }
      return product.specifications;
    } catch (e) {
      console.error('Ошибка парсинга характеристик:', e);
      return {};
    }
  };

  // Функция для фильтрации нерелевантных характеристик
  const filterRelevantSpecs = (specs, productType) => {
    const irrelevantSpecs = {
      phone: ['smart_tv', 'screen_type', 'hdmi', 'smart_features'],
      tv: ['sim', 'camera', 'frontCamera', 'ram', 'processor', 'battery', 'waterproof'],
      laptop: ['sim', 'camera', 'frontCamera', 'waterproof'],
      tablet: ['smart_tv', 'hdmi'],
      headphones: ['sim', 'camera', 'display', 'processor', 'ram', 'storage', 'os']
    };

    const filteredSpecs = { ...specs };
    const specsToRemove = irrelevantSpecs[productType] || [];

    specsToRemove.forEach(key => {
      delete filteredSpecs[key];
    });

    return filteredSpecs;
  };

  // Функция для отображения характеристик
  const renderSpecifications = () => {
    const rawSpecs = parseSpecifications();
    const productType = determineProductType(product);
    const specs = filterRelevantSpecs(rawSpecs, productType);
    
    if (Object.keys(specs).length === 0) {
      return (
        <Alert variant="info" className="no-specs-alert">
          <Alert.Heading>Характеристики отсутствуют</Alert.Heading>
          <p>Технические характеристики для этого товара пока не добавлены.</p>
        </Alert>
      );
    }

    // Базовые группы характеристик для всех товаров
    const baseGroups = {
      'Основные': [
        { label: 'Процессор', value: specs.processor },
        { label: 'Оперативная память', value: specs.ram || specs.memory },
        { label: 'Встроенная память', value: specs.storage || specs.ssd },
        { label: 'Цвет', value: specs.color },
        { label: 'Материал', value: specs.material },
      ],
      'Дисплей': [
        { label: 'Тип дисплея', value: specs.display },
        { label: 'Разрешение', value: specs.resolution },
        { label: 'Размер экрана', value: specs.screenSize || specs.screen || specs.diagonal },
      ],
      'Система': [
        { label: 'Операционная система', value: specs.os },
        { label: 'Версия ОС', value: specs.osVersion },
      ],
      'Дополнительно': [
        { label: 'Водозащита', value: specs.waterproof },
        { label: 'Вес', value: specs.weight },
        { label: 'Гарантия', value: specs.warranty },
        { label: 'Тип', value: specs.type },
      ]
    };

    // Специфические группы для разных типов товаров
    const specificGroups = {
      phone: {
        'Основные': [
          ...baseGroups['Основные'],
          { label: 'SIM-карты', value: specs.sim }
        ],
        'Камера': [
          { label: 'Основная камера', value: specs.camera },
          { label: 'Фронтальная камера', value: specs.frontCamera },
          { label: 'Видеозапись', value: specs.video },
        ],
        'Связь': [
          { label: 'NFC', value: specs.nfc ? 'Есть' : specs.nfc === false ? 'Нет' : null },
          { label: 'Сеть', value: specs.network },
          { label: 'GPS', value: specs.gps ? 'Есть' : specs.gps === false ? 'Нет' : null },
          { label: 'Bluetooth', value: specs.bluetooth },
          { label: 'Wi-Fi', value: specs.wifi },
        ],
        'Батарея': [
          { label: 'Ёмкость аккумулятора', value: specs.battery },
          { label: 'Быстрая зарядка', value: specs.fastCharge },
          { label: 'Беспроводная зарядка', value: specs.wirelessCharge },
        ],
        'Дисплей': baseGroups['Дисплей'],
        'Система': baseGroups['Система'],
        'Дополнительно': baseGroups['Дополнительно']
      },
      
      tv: {
        'Основные': baseGroups['Основные'].filter(spec => spec.label !== 'Процессор'),
        'Дисплей': baseGroups['Дисплей'],
        'Smart функции': [
          { label: 'Smart TV', value: specs.smart_tv ? 'Есть' : 'Нет' },
          { label: 'Wi-Fi', value: specs.wifi },
          { label: 'Bluetooth', value: specs.bluetooth },
        ],
        'Подключения': [
          { label: 'HDMI', value: specs.hdmi },
          { label: 'USB', value: specs.usb },
        ],
        'Дополнительно': baseGroups['Дополнительно']
      },
      
      // Добавьте другие типы товаров по необходимости...
      
      default: baseGroups
    };

    const specGroups = specificGroups[productType] || specificGroups.default;

    return (
      <div className="specifications-tab">
        {Object.entries(specGroups).map(([groupName, specifications]) => {
          const validSpecs = specifications.filter(spec => 
            spec.value !== undefined && 
            spec.value !== null && 
            spec.value !== '' &&
            spec.value !== 'null'
          );
          
          if (validSpecs.length === 0) return null;

          return (
            <div key={groupName} className="spec-group">
              <h5 className="spec-group-title">{groupName}</h5>
              <div className="spec-list">
                {validSpecs.map((spec, index) => (
                  <Row key={index} className="spec-item">
                    <Col md={6} className="spec-label">
                      {spec.label}
                    </Col>
                    <Col md={6} className="spec-value">
                      {spec.value}
                    </Col>
                  </Row>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="tab-content p-4 border">
            <h4>Описание товара</h4>
            <p className="product-description">
              {product?.description || 'Описание товара появится скоро.'}
            </p>
          </div>
        );
      
      case 'specifications':
        return (
          <div className="tab-content p-4 border">
            <h4>Технические характеристики</h4>
            {renderSpecifications()}
          </div>
        );
      
      case 'reviews':
        return (
          <div className="tab-content p-4 border">
            <h4>Отзывы о товаре ({reviews.length})</h4>
            
            {/* Кнопка написания отзыва */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <strong>Рейтинг: </strong>
                {reviews.length > 0 ? (
                  <span>
                    {(
                      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                    ).toFixed(1)}/5 ({reviews.length} отзывов)
                  </span>
                ) : (
                  <span>Нет оценок</span>
                )}
              </div>
              
              {isAuthenticated && !hasUserReviewed && (
                <button 
                  className="btn btn-primary"
                  onClick={onWriteReview}
                >
                  Написать отзыв
                </button>
              )}
            </div>

            {/* Компонент списка отзывов */}
            <ReviewList 
              reviews={reviews}
              loading={reviewsLoading}
              currentUser={isAuthenticated ? { id: 'current-user-id' } : null}
            />
          </div>
        );
      
      case 'delivery':
        return (
          <div className="tab-content p-4 border">
            <h4>Условия доставки и оплаты</h4>
            <div className="delivery-info row">
              <div className="info-item col-md-6 mb-3">
                <h5>🚚 Доставка</h5>
                <ul className="list-unstyled">
                  <li>• Курьером по Москве - 1-2 дня</li>
                  <li>• Самовывоз из пункта выдачи - бесплатно</li>
                  <li>• Почтой России - 5-10 дней</li>
                  <li>• СДЭК - 2-4 дня</li>
                </ul>
              </div>
              <div className="info-item col-md-6 mb-3">
                <h5>💳 Оплата</h5>
                <ul className="list-unstyled">
                  <li>• Наличными курьеру</li>
                  <li>• Банковской картой онлайн</li>
                  <li>• Рассрочка 0% на 12 месяцев</li>
                  <li>• Оплата при получении</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container className="product-tabs-container">
      <div className="tabs-header d-flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button flex-fill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      
      {renderTabContent()}
    </Container>
  );
};

export default ProductTabs;