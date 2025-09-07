// components/UI/ImageWithFallback.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';

const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;