import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_slug: '',
    brand: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await adminService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
      } else {
        await adminService.createProduct(formData);
      }
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '', category_slug: '', brand: '', stock: '' });
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category_slug: product.category_slug,
      brand: product.brand,
      stock: product.stock
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await adminService.deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="product-manager">
      <h2>Управление товарами</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Название товара"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Цена"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
        <textarea
          placeholder="Описание"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <button type="submit">{editingProduct ? 'Обновить' : 'Создать'}</button>
        {editingProduct && (
          <button type="button" onClick={() => setEditingProduct(null)}>
            Отмена
          </button>
        )}
      </form>

      <div className="products-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>Цена: {product.price} руб.</p>
            <p>Категория: {product.category_slug}</p>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)}>Редактировать</button>
              <button onClick={() => handleDelete(product.id)} className="delete">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;