import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Spinner } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaExpand, FaImage, FaTimes } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [imageLoadState, setImageLoadState] = useState({ loading: true, error: false });

  const imageRef = useRef(null);
  const modalContentRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Вычисляем массив изображений напрямую из пропса
  const images = useMemo(() => {
    if (!product) return [];

    let result = [];

    // 1. Прямой массив images
    if (product.images && Array.isArray(product.images)) {
      result = product.images.filter(url => url && typeof url === 'string' && url.trim() !== '');
      if (result.length > 0) return result;
    }

    // 2. image_url может быть массивом, строкой JSON или простой строкой
    if (product.image_url) {
      if (Array.isArray(product.image_url)) {
        result = product.image_url.filter(url => url && typeof url === 'string' && url.trim() !== '');
        if (result.length > 0) return result;
      } else if (typeof product.image_url === 'string') {
        try {
          const parsed = JSON.parse(product.image_url);
          if (Array.isArray(parsed)) {
            result = parsed.filter(url => url && typeof url === 'string' && url.trim() !== '');
            if (result.length > 0) return result;
          } else {
            return [product.image_url];
          }
        } catch {
          return [product.image_url];
        }
      }
    }

    // 3. Отдельное поле image (устаревшее)
    if (product.image && typeof product.image === 'string') {
      return [product.image];
    }

    return [];
  }, [product]);

  // Сброс индекса при изменении массива изображений
  useEffect(() => {
    setCurrentIndex(0);
    setImageLoadState({ loading: true, error: false });
  }, [images]);

  // Обработка загрузки главного изображения
  useEffect(() => {
    if (!imageRef.current || images.length === 0) return;

    const img = imageRef.current;

    const handleLoad = () => {
      setImageLoadState({ loading: false, error: false });
    };

    const handleError = () => {
      if (images.length > 1 && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setImageLoadState({ loading: false, error: true });
      }
    };

    if (img.complete && img.naturalHeight !== 0) {
      setImageLoadState({ loading: false, error: false });
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [currentIndex, images]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const openModal = useCallback(() => {
    if (images.length > 0 && images[currentIndex]) {
      setShowModal(true);
    }
  }, [images, currentIndex]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Обработка свайпов для модалки
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[currentIndex] : null;

  if (!hasImages) {
    return (
      <div className="product-gallery">
        <div className="main-image-container">
          <div className="image-wrapper">
            <div className="no-image-placeholder">
              <FaImage size={48} className="mb-3" />
              <p>Нет изображений для этого товара</p>
              <small className="text-muted">{product?.name || ''}</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Основное изображение */}
      <div className="main-image-container">
        <div className="image-wrapper">
          {imageLoadState.loading && (
            <div className="image-loading">
              <Spinner animation="border" variant="primary" />
              <div>Загрузка...</div>
            </div>
          )}

          <img
            ref={imageRef}
            src={mainImage}
            alt={product?.name || 'Товар'}
            className={`main-product-image ${imageLoadState.loading ? 'hidden' : ''}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: imageLoadState.loading ? 'none' : 'block'
            }}
            fetchPriority="high"
          />

          {imageLoadState.error && (
            <div className="image-error">
              <FaImage size={48} className="mb-3" />
              <p>Ошибка загрузки</p>
            </div>
          )}

          {images.length > 1 && !imageLoadState.error && (
            <>
              <button className="nav-btn prev-btn" onClick={prevImage} aria-label="Предыдущее">
                <FaChevronLeft />
              </button>
              <button className="nav-btn next-btn" onClick={nextImage} aria-label="Следующее">
                <FaChevronRight />
              </button>
            </>
          )}

          {!imageLoadState.loading && !imageLoadState.error && (
            <button className="expand-btn" onClick={openModal} aria-label="Увеличить">
              <FaExpand />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Миниатюры – отображаются только если несколько изображений */}
      {images.length > 1 && (
        <div className="thumbnails-wrapper">
          <div className="thumbnails-container">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`thumbnail-item ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={imgUrl}
                  alt={`Миниатюра ${idx + 1}`}
                  className="thumbnail-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://electronic.tw1.ru/images/placeholder.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно */}
      {showModal && ReactDOM.createPortal(
        <div
          className="modal-overlay"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            cursor: 'pointer'
          }}
        >
          <div
            className="modal-content"
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Закрыть"
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '3rem',
                cursor: 'pointer',
                zIndex: 1000001,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>

            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt={product?.name || 'Товар'}
                  className="modal-image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      className="modal-nav-btn modal-prev"
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      aria-label="Предыдущее"
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(5px)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        transition: 'all 0.3s ease',
                        zIndex: 1000001
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      className="modal-nav-btn modal-next"
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      aria-label="Следующее"
                      style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(5px)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        transition: 'all 0.3s ease',
                        zIndex: 1000001
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      <FaChevronRight />
                    </button>

                    <div
                      className="modal-counter"
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        zIndex: 1000001
                      }}
                    >
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="modal-error" style={{ color: 'white', textAlign: 'center' }}>
                <FaImage size={48} />
                <p>Изображение недоступно</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default React.memo(ProductGallery);