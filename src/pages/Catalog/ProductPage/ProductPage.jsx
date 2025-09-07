import React from 'react';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Товар ID: {id}</h1>
      <p>Страница товара</p>
    </div>
  );
};

export default ProductPage;