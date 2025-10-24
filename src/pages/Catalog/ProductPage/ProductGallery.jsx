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

  useEffect(() => {
    console.log('🎨 ProductGallery - product:', product);
    console.log('🎨 ProductGallery - product.images:', product?.images);
    console.log('🎨 ProductGallery - product.image_url:', product?.image_url);
    console.log('🎨 ProductGallery - product.image:', product?.image);
    
    if (product) {
      let imageArray = [];
      
      // Приоритет получения изображений:
      if (product.images && Array.isArray(product.images)) {
        imageArray = product.images;
        console.log('🖼️ Using images array:', imageArray);
      } else if (product.image_url) {
        if (Array.isArray(product.image_url)) {
          imageArray = product.image_url;
          console.log('🖼️ Using image_url as array:', imageArray);
        } else if (typeof product.image_url === 'string') {
          // Попробуем парсить как JSON
          try {
            const parsed = JSON.parse(product.image_url);
            if (Array.isArray(parsed)) {
              imageArray = parsed;
              console.log('🖼️ Parsed image_url as JSON array:', imageArray);
            } else {
              imageArray = [product.image_url];
              console.log('🖼️ Using image_url as string:', imageArray);
            }
          } catch (e) {
            imageArray = [product.image_url];
            console.log('🖼️ Using image_url as string (not JSON):', imageArray);
          }
        }
      } else if (product.image) {
        imageArray = [product.image];
        console.log('🖼️ Using single image:', imageArray);
      }
      
      // Фильтруем валидные URL и нормализуем их
      const validImages = imageArray.filter(url => {
        const isValid = url && typeof url === 'string' && url.trim() !== '';
        console.log(`🖼️ Image "${url}": ${isValid ? 'VALID' : 'INVALID'}`);
        return isValid;
      }).map(url => {
        // Нормализуем URL для продакшн сервера
        if (url.startsWith('http')) {
          return url;
        } else if (url.startsWith('/')) {
          // Для относительных путей добавляем домен
          return `https://electronic.tw1.ru${url}`;
        } else {
          // Для путей без слеша добавляем /images/
          return `https://electronic.tw1.ru/images/${url}`;
        }
      });
      
      console.log('🖼️ Final valid images:', validImages);
      setImages(validImages);
      setCurrentIndex(0);
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
    imagesCount: images.length,
    images: images
  });

  // 🔧 Сбрасываем состояния загрузки/ошибки при смене изображения
  useEffect(() => {
    if (images.length === 0) return;
    setImageLoading(true);
    setImageError(false);
  }, [currentIndex, images.length]);

  const nextImage = () => {
    if (images.length <= 1) return;
    console.log('➡️ Next image clicked, current:', currentIndex);
    const nextIndex = (currentIndex + 1) % images.length;
    console.log('➡️ Next index:', nextIndex);
    setCurrentIndex(nextIndex);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    console.log('⬅️ Prev image clicked, current:', currentIndex);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    console.log('⬅️ Prev index:', prevIndex);
    setCurrentIndex(prevIndex);
  };

  const selectImage = (index) => {
    if (index === currentIndex) return;
    console.log('🖱️ Thumbnail clicked, index:', index);
    setCurrentIndex(index);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', mainImage);
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', mainImage);
    setImageLoading(false);
    setImageError(true);
  };

  // Если нет картинок
  if (!hasImages) {
    console.log('🚫 No images available, product:', product);
    console.log('🚫 Images array:', images);
    console.log('🚫 Product images field:', product?.images);
    console.log('🚫 Product image_url field:', product?.image_url);
    console.log('🚫 Product image field:', product?.image);
    
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
              <div style={{ fontSize: '10px', marginTop: '10px' }}>
                Debug: images.length = {images.length}
              </div>
              {/* Отладочная информация */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{ fontSize: '8px', marginTop: '10px', textAlign: 'left' }}>
                  <div>Product.images: {JSON.stringify(product?.images)}</div>
                  <div>Product.image_url: {JSON.stringify(product?.image_url)}</div>
                  <div>Product.image: {JSON.stringify(product?.image)}</div>
                </div>
              )}
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
              className="modal-image"
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