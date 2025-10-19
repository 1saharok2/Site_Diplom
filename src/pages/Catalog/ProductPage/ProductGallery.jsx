import React, { useState, useEffect } from 'react';
import { Row, Col, Image, Spinner } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaExpand, FaImage } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [images, setImages] = useState([]);
  const [animationDirection, setAnimationDirection] = useState('none');

  useEffect(() => {
    console.log('🎨 ProductGallery - product:', product);
    
    if (product) {
      let imageArray = [];
      
      // Проверяем разные варианты получения картинок
      if (product.image_url && Array.isArray(product.image_url)) {
        imageArray = product.image_url;
        console.log('🖼️ Using image_url:', imageArray);
      } else if (product.images && Array.isArray(product.images)) {
        imageArray = product.images;
        console.log('🖼️ Using images:', imageArray);
      } else if (product.image) {
        imageArray = [product.image];
        console.log('🖼️ Using single image:', imageArray);
      }
      
      // Фильтруем валидные URL
      const validImages = imageArray.filter(url => {
        const isValid = url && typeof url === 'string' && url.trim() !== '';
        console.log(`🖼️ Image ${url}: ${isValid ? 'VALID' : 'INVALID'}`);
        return isValid;
      });
      
      console.log('🖼️ Final valid images:', validImages);
      setImages(validImages);
      
      // Сбрасываем состояние загрузки
      setImageLoading(true);
      setImageError(false);
    }
  }, [product]);

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentIndex] : null;

  console.log('🎨 Gallery state:', {
    hasImages,
    mainImage,
    currentIndex,
    imageLoading,
    imageError,
    imagesCount: images.length
  });

  const nextImage = () => {
    if (images.length <= 1) return;
    setAnimationDirection('next');
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setImageLoading(true);
    setImageError(false);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setAnimationDirection('prev');
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setImageLoading(true);
    setImageError(false);
  };

  const selectImage = (index) => {
    if (index === currentIndex) return;
    
    setAnimationDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
    setImageLoading(true);
    setImageError(false);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', mainImage);
    setImageLoading(false);
    setTimeout(() => setAnimationDirection('none'), 300);
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', mainImage);
    setImageLoading(false);
    setImageError(true);
    e.target.src = '/images/placeholder.jpg';
    setTimeout(() => setAnimationDirection('none'), 300);
  };

  // Если нет картинок
  if (!hasImages) {
    console.log('🚫 No images available');
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

  console.log('🎨 Rendering gallery with image:', mainImage);

  return (
    <div className="product-gallery">
      {/* Главное изображение */}
      <div className="main-image-container">
        <div className="image-wrapper">
          {imageLoading && (
            <div className="image-loading">
              <Spinner animation="border" variant="primary" />
              <div>Загрузка изображения...</div>
              <small>{mainImage}</small>
            </div>
          )}
          
          <Image
            src={mainImage}
            alt={product?.name || 'Изображение товара'}
            className={`main-product-image ${imageLoading ? 'hidden' : ''} ${animationDirection}`}
            fluid
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {imageError && (
            <div className="image-error">
              <FaImage size={48} className="mb-3" />
              <p>Ошибка загрузки изображения</p>
              <small className="text-muted">
                URL: {mainImage}
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
              className={`modal-image ${animationDirection}`}
              fluid
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
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