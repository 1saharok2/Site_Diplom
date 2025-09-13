import React from 'react';
import { Carousel, Image, Badge } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product, selectedImageIndex, onSelectImage }) => {
  return (
    <div className="product-gallery">
      <Carousel 
        activeIndex={selectedImageIndex} 
        onSelect={onSelectImage}
        interval={null}
        indicators={product.images.length > 1}
        className="product-carousel"
        nextIcon={<FaChevronRight className="carousel-control-icon" />}
        prevIcon={<FaChevronLeft className="carousel-control-icon" />}
      >
        {product.images.map((image, index) => (
          <Carousel.Item key={index}>
            <div className="main-image-container">
              <div className="image-wrapper">
                <Image 
                  src={image} 
                  alt={product.name}
                  className="main-product-image"
                  fluid
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения';
                  }}
                />
              </div>
              
              {product.isNew && (
                <Badge bg="success" className="new-badge">Новинка</Badge>
              )}
              {product.discount > 0 && (
                <Badge bg="danger" className="discount-badge">-{product.discount}%</Badge>
              )}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Миниатюры */}
      {product.images.length > 1 && (
        <div className="thumbnails">
          {product.images.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
              onClick={() => onSelectImage(index)}
            >
              <div className="thumbnail-wrapper">
                <Image 
                  src={image} 
                  alt={`${product.name} ${index + 1}`}
                  fluid
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80/8767c2/ffffff?text=Img';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;