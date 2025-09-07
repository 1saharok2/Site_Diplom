import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryPage = () => {
  const { slug } = useParams();
  
  return (
    <div>
      <h1>Категория: {slug}</h1>
      <p>Страница категории</p>
    </div>
  );
};

export default CategoryPage;