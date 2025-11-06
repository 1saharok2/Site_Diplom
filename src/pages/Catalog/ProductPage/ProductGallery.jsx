import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaExpand, FaImage } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [images, setImages] = useState([]);

  // Мемоизированный список изображений
  const normalizedImages = useMemo(() => {
    if (!product) return [];
    
    let imageArray = [];
    
    // Приоритет получения изображений
    if (product.images && Array.isArray(product.images)) {
      imageArray = product.images;
    } else if (product.image_url) {
      if (Array.isArray(product.image_url)) {
        imageArray = product.image_url;
      } else if (typeof product.image_url === 'string') {
        try {
          const parsed = JSON.parse(product.image_url);
          imageArray = Array.isArray(parsed) ? parsed : [product.image_url];
        } catch (e) {
          imageArray = [product.image_url];
        }
      }
    } else if (product.image) {
      imageArray = [product.image];
    }
    
    // Фильтруем и нормализуем URL
    return imageArray
      .filter(url => url && typeof url === 'string' && url.trim() !== '')
      .map(url => {
        if (url.startsWith('http')) {
          return url;
        } else if (url.startsWith('/')) {
          return `https://electronic.tw1.ru${url}`;
        } else {
          return `https://electronic.tw1.ru/images/${url}`;
        }
      });
  }, [product]);

  // Эффект для установки изображений
  useEffect(() => {
    console.log('🎨 ProductGallery - normalized images:', normalizedImages);
    setImages(normalizedImages);
    setCurrentIndex(0);
    setImageLoading(true);
    setImageError(false);
  }, [normalizedImages]);

  // Мемоизированные обработчики
  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
  }, [currentIndex, images.length]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
  }, [currentIndex, images.length]);

  const selectImage = useCallback((index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  }, [currentIndex]);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Image loaded successfully');
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback((e) => {
    console.log('❌ Image failed to load');
    
    // Пробуем загрузить следующее изображение
    if (images.length > 1 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    
    setImageLoading(false);
    setImageError(true);
  }, [currentIndex, images.length]);

  // Сбрасываем состояния при смене изображения
  useEffect(() => {
    if (images.length === 0) return;
    setImageLoading(true);
    setImageError(false);
  }, [currentIndex, images.length]);

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentIndex] : null;

  // Если нет картинок
  if (!hasImages) {
    return (
      <div className="product-gallery">
        <div className="main-image-container">
          <div className="image-wrapper">
            <div className="no-image-placeholder">
              <FaImage size={48} className="mb-3" />
              <p>Нет изображений для этого товара</p>
              <small className="text-muted">
                {product?.name || 'Неизвестный товар'}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Главное изображение */}
      <div className="main-image-container">
        <div className="image-wrapper">
          {imageLoading && (
            <div className="image-loading">
              <Spinner animation="border" variant="primary" />
              <div>Загрузка изображения...</div>
            </div>
          )}
          
          <Image
            src={mainImage}
            alt={product?.name || 'Изображение товара'}
            className={`main-product-image ${imageLoading ? 'hidden' : ''}`}
            fluid
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
          
          {imageError && (
            <div className="image-error">
              <FaImage size={48} className="mb-3" />
              <p>Ошибка загрузки изображения</p>
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
          {hasImages && !imageLoading && !imageError && (
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
                    alt={`${product?.name || 'Товар'} - изображение ${index + 1}`}
                    className="thumbnail-image"
                    fluid
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
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
              alt={product?.name || 'Изображение товара'}
              className="modal-image"
              fluid
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

export default React.memo(ProductGallery);