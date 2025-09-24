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
    if (product) {
      if (product.image_url && Array.isArray(product.image_url)) {
        const validImages = product.image_url.filter(url => 
          url && typeof url === 'string' && url.trim() !== ''
        );
        setImages(validImages);
      } else {
        setImages([]);
      }
    }
  }, [product]);

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentIndex] : null;

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
    setImageLoading(false);
    setTimeout(() => setAnimationDirection('none'), 300);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageError(true);
    e.target.src = '/placeholder-product.jpg';
    setTimeout(() => setAnimationDirection('none'), 300);
  };

  if (!hasImages) {
    return (
      <div className="product-gallery">
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
      {/* Главное изображение */}
      <div className="main-image-container">
        <div className="image-wrapper">
          {imageLoading && (
            <div className="image-loading">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          
          <Image
            src={mainImage}
            alt={product.name}
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
              className={`modal-image ${animationDirection}`}
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