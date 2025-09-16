import React, { useState, useEffect } from 'react';
import { Row, Col, Image, Spinner, Alert } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaExpand, FaImage } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (product) {
      console.log('🎯 Получен продукт для галереи:', product);
      console.log('🖼️ Image_url из продукта:', product.image_url);
      console.log('📊 Тип image_url:', typeof product.image_url);
      console.log('📏 Длина image_url:', Array.isArray(product.image_url) ? product.image_url.length : 'не массив');
      
      // Используем image_url из продукта (уже обработан в categoryService)
      if (product.image_url && Array.isArray(product.image_url)) {
        const validImages = product.image_url.filter(url => 
          url && typeof url === 'string' && url.trim() !== ''
        );
        
        console.log('✅ Валидные изображения:', validImages);
        setImages(validImages);
      } else {
        console.log('⚠️ Нет изображений в продукте');
        setImages([]);
      }
    }
  }, [product]);

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentIndex] : null;

  const nextImage = () => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setImageLoading(true);
    setImageError(false);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setImageLoading(true);
    setImageError(false);
  };

  const selectImage = (index) => {
    setCurrentIndex(index);
    setImageLoading(true);
    setImageError(false);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено успешно');
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    console.error('❌ Ошибка загрузки изображения');
    setImageLoading(false);
    setImageError(true);
    // Заменяем на заглушку при ошибке
    e.target.src = '/placeholder-product.jpg';
  };

  if (!hasImages) {
    return (
      <div className="product-gallery">
        <Alert variant="info" className="mb-3">
          <h6>📷 Информация об изображениях</h6>
          <small>
            ID товара: {product.id}<br/>
            Image_url: {JSON.stringify(product.image_url)}<br/>
            Тип: {typeof product.image_url}<br/>
            Количество: {images.length}
          </small>
        </Alert>
        
        <div className="main-image-container">
          <div className="image-wrapper">
            <div className="no-image-placeholder">
              <FaImage size={48} className="mb-3" />
              <p>Нет изображений для этого товара</p>
              <small className="text-muted">
                {product.name}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <Alert variant="success" className="mb-3">
        <h6>✅ Изображения загружены из базы</h6>
        <small>
          Товар: {product.name}<br/>
          Найдено {images.length} изображений
        </small>
      </Alert>

      {/* Главное изображение */}
      <div className="main-image-container">
        <div className="image-wrapper">
          {imageLoading && (
            <div className="image-loading">
              <Spinner animation="border" variant="primary" />
              <div style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                Загрузка изображения {currentIndex + 1} из {images.length}...
              </div>
            </div>
          )}
          
          <Image
            src={mainImage}
            alt={product.name}
            className={`main-product-image ${imageLoading ? 'hidden' : ''}`}
            fluid
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {imageError && (
            <div className="image-error">
              <FaImage size={48} className="mb-3" />
              <p>Ошибка загрузки изображения</p>
              <small className="text-muted">
                URL: {mainImage?.substring(0, 50)}...
              </small>
            </div>
          )}
          
          {/* Кнопки навигации */}
          {images.length > 1 && (
            <>
              <button className="nav-btn prev-btn" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              <button className="nav-btn next-btn" onClick={nextImage}>
                <FaChevronRight />
              </button>
            </>
          )}
          
          {/* Кнопка полноэкранного режима */}
          {hasImages && (
            <button className="expand-btn" onClick={openModal}>
              <FaExpand />
            </button>
          )}
        </div>
        
        {/* Счетчик изображений */}
        {images.length > 1 && (
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <Row className="thumbnails-row">
          <Col>
            <div className="thumbnails-container">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => selectImage(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} - изображение ${index + 1}`}
                    className="thumbnail-image"
                    fluid
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </Col>
        </Row>
      )}

      {/* Модальное окно */}
      {showModal && hasImages && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <Image
              src={mainImage}
              alt={product.name}
              className="modal-image"
              fluid
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
            {images.length > 1 && (
              <div className="modal-navigation">
                <button className="modal-nav-btn" onClick={prevImage}>
                  <FaChevronLeft />
                </button>
                <div className="modal-counter">
                  {currentIndex + 1} / {images.length}
                </div>
                <button className="modal-nav-btn" onClick={nextImage}>
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;