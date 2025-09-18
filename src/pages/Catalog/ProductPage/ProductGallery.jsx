import React from 'react';
import { Carousel, Image, Badge } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ProductPage_css/ProductGallery.css';

const ProductGallery = ({ product, selectedImageIndex, onSelectImage }) => {
  const images = product.images?.length > 0 ? product.images : 
    ['null'];

  return (
    <div className="product-gallery">
      <Carousel 
        activeIndex={selectedImageIndex} 
        onSelect={onSelectImage}
        interval={null}
        indicators={images.length > 1}
        nextIcon={<FaChevronRight />}
        prevIcon={<FaChevronLeft />}
      >
        {images.map((image, index) => (
          <Carousel.Item key={index}>
            <div className="main-image-container">
              <div className="image-wrapper">
                <Image 
                  src={image} 
                  alt={product.name}
                  className="main-product-image"
                  fluid
                  onError={(e) => {
                    e.target.src = 'null';
                  }}
                />
              </div>
              
              {product.isNew && (
                <Badge bg="success" className="new-badge">Новинка</Badge>
              )}
              {product.oldPrice > product.price && (
                <Badge bg="danger" className="discount-badge">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </Badge>
              )}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
              onClick={() => onSelectImage(index)}
            >
              <Image 
                src={image} 
                alt={`${product.name} ${index + 1}`}
                fluid
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;