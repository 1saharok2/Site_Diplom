import React, { useState, useEffect } from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaShare, FaStar, FaRegHeart, FaCheck, FaTimes } from 'react-icons/fa';
import { supabase } from '../../../services/supabaseClient'
import './ProductPage_css/ProductInfo.css';

const ProductInfo = ({ product, onVariantChange }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(product);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [exactMatch, setExactMatch] = useState(null);

  // Функция для нормализации спецификаций
  const normalizeSpecifications = (specs) => {
    if (!specs) return {};
    
    try {
      if (typeof specs === 'string') {
        return JSON.parse(specs);
      }
      return specs;
    } catch (e) {
      console.error('Ошибка парсинга спецификаций:', e);
      return {};
    }
  };

  // Функция для нормализации значения памяти (приводим к единому формату)
  const normalizeStorage = (storage) => {
    if (!storage) return '';
    
    return storage.toString()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/гб/g, 'gb')
      .replace(/gb/g, ' гб')
      .trim()
      .toUpperCase();
  };

  // Функция для нормализации значения цвета
  const normalizeColor = (color) => {
    if (!color) return '';
    
    return color.toString()
      .toLowerCase()
      .trim();
  };

  // Функция для получения значения с нормализацией
  const getSpecValue = (variant, key) => {
    const specs = normalizeSpecifications(variant.specifications);
    return specs[key] || '';
  };

  // Улучшенная функция для извлечения базового названия продукта
  const getBaseProductName = (productName) => {
    // Более мягкое удаление информации о памяти и цвете
    // Удаляем только конкретные паттерны памяти в конце строки
    let baseName = productName
      .replace(/\s*(128GB|256GB|512GB|\d+GB|128 ГБ|256 ГБ|512 ГБ|\d+ ГБ)\s*$/gi, '')
      .replace(/\s*(Черный|Белый|Розовый|Синий|Blue|White|Pink|Black|Phantom Black|Snow|Silver|Rococo Pearl|Aurora Gray)\s*$/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Для iPhone оставляем только "Apple iPhone 16"
    if (baseName.includes('Apple iPhone 16')) {
      baseName = 'Apple iPhone 16';
    }
    
    // Для Samsung оставляем только основное название
    if (baseName.includes('Samsung Galaxy')) {
      baseName = baseName.replace(/\s*Ultra\s*$/, '').trim();
    }
    
    return baseName;
  };

  // Загрузка вариантов товара
  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      try {
        // Получаем базовое название для поиска вариантов
        const baseName = getBaseProductName(product.name);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('price');

        if (error) throw error;

        // Фильтруем варианты по базовому названию
        const productVariants = data.filter(v => {
          const variantBaseName = getBaseProductName(v.name);
          return variantBaseName === baseName;
        });
        
        setVariants(productVariants);
        
        // Устанавливаем начальные значения из продукта
        if (product.specifications) {
          const initialSpecs = normalizeSpecifications(product.specifications);
          const initialColor = normalizeColor(initialSpecs.color || '');
          const initialStorage = normalizeStorage(initialSpecs.storage || '');
          
          setSelectedColor(initialColor);
          setSelectedStorage(initialStorage);
        }
        
        setSelectedVariant(product);
        
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (product?.name) {
      fetchVariants();
    }
  }, [product]);

  // Находим точное совпадение при изменении выбранных параметров
  useEffect(() => {
    if (variants.length > 0) {
      let foundExactMatch = null;
      
      // Если выбраны оба параметра, ищем точное совпадение
      if (selectedColor && selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vColor = normalizeColor(vSpecs.color);
          const vStorage = normalizeStorage(vSpecs.storage);
          
          const colorMatch = vColor === selectedColor;
          const storageMatch = vStorage === selectedStorage;
          
          return colorMatch && storageMatch;
        });
      } 
      // Если выбран только цвет, находим первый вариант с этим цветом
      else if (selectedColor && !selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vColor = normalizeColor(vSpecs.color);
          return vColor === selectedColor;
        });
      }
      // Если выбрана только память, находим первый вариант с этой памятью
      else if (!selectedColor && selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vStorage = normalizeStorage(vSpecs.storage);
          return vStorage === selectedStorage;
        });
      }
      
      setExactMatch(foundExactMatch || null);
      
      if (foundExactMatch && foundExactMatch.id !== selectedVariant.id) {
        setSelectedVariant(foundExactMatch);
        if (onVariantChange) {
          onVariantChange(foundExactMatch);
        }
      }
    } else {
      setExactMatch(null);
    }
  }, [selectedColor, selectedStorage, variants]);

  // Получаем доступные цвета и объемы памяти (с нормализацией)
  const availableColors = [...new Set(variants
    .map(v => {
      const color = normalizeColor(getSpecValue(v, 'color'));
      return color && color.trim() !== '' ? color : null;
    })
    .filter(color => color !== null)
  )];

  const availableStorage = [...new Set(variants
    .map(v => {
      const storage = normalizeStorage(getSpecValue(v, 'storage'));
      return storage && storage.trim() !== '' ? storage : null;
    })
    .filter(storage => storage !== null)
  )];

  // Проверяем, есть ли у товара варианты для выбора
  const hasVariants = availableColors.length > 0 || availableStorage.length > 0;

  // Проверяем доступность конкретного цвета
  const isColorAvailable = (color) => {
    const normalizedColor = normalizeColor(color);
    return variants.some(v => 
      normalizeColor(getSpecValue(v, 'color')) === normalizedColor && 
      v.stock > 0
    );
  };

  // Проверяем доступность конкретного объема памяти
  const isStorageAvailable = (storage) => {
    const normalizedStorage = normalizeStorage(storage);
    return variants.some(v => 
      normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage && 
      v.stock > 0
    );
  };

  const handleColorSelect = (color) => {
    const normalizedColor = normalizeColor(color);
    setSelectedColor(normalizedColor);
    
    // Автоматически выбираем подходящий вариант
    let match = null;
    
    // Если уже выбрана память, ищем вариант с обоими параметрами
    if (selectedStorage) {
      match = variants.find(v => 
        normalizeColor(getSpecValue(v, 'color')) === normalizedColor && 
        normalizeStorage(getSpecValue(v, 'storage')) === selectedStorage
      );
    }
    
    // Если не нашли или память не выбрана, берем первый доступный вариант с этим цветом
    if (!match) {
      match = variants.find(v => 
        normalizeColor(getSpecValue(v, 'color')) === normalizedColor
      );
    }
    
    if (match) {
      setSelectedVariant(match);
      if (onVariantChange) {
        onVariantChange(match);
      }
      
      // Обновляем память, если нашли вариант
      const matchStorage = normalizeStorage(getSpecValue(match, 'storage'));
      if (matchStorage && matchStorage !== selectedStorage) {
        setSelectedStorage(matchStorage);
      }
    }
  };

  const handleStorageSelect = (storage) => {
    const normalizedStorage = normalizeStorage(storage);
    setSelectedStorage(normalizedStorage);
    
    // Автоматически выбираем подходящий вариант
    let match = null;
    
    // Если уже выбран цвет, ищем вариант с обоими параметрами
    if (selectedColor) {
      match = variants.find(v => 
        normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage && 
        normalizeColor(getSpecValue(v, 'color')) === selectedColor
      );
    }
    
    // Если не нашли или цвет не выбран, берем первый доступный вариант с этой памятью
    if (!match) {
      match = variants.find(v => 
        normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage
      );
    }
    
    if (match) {
      setSelectedVariant(match);
      if (onVariantChange) {
        onVariantChange(match);
      }
      
      // Обновляем цвет, если нашли вариант
      const matchColor = normalizeColor(getSpecValue(match, 'color'));
      if (matchColor && matchColor !== selectedColor) {
        setSelectedColor(matchColor);
      }
    }
  };

  // Можно добавить в корзину, если вариант существует И есть в наличии
  const canAddToCart = exactMatch && exactMatch.stock > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    
    setIsInCart(true);
    setTimeout(() => setIsInCart(false), 2000);
    
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemId = exactMatch.id;
    
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id: exactMatch.id,
        name: exactMatch.name,
        price: exactMatch.price,
        oldPrice: exactMatch.old_price,
        image: exactMatch.image_url?.[0] || '',
        quantity: 1,
        color: getSpecValue(exactMatch, 'color'),
        storage: getSpecValue(exactMatch, 'storage'),
        slug: exactMatch.slug
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Для отображения используем либо точное совпадение, либо текущий вариант
  const displayVariant = exactMatch || selectedVariant;
  const hasDiscount = displayVariant?.old_price && displayVariant?.price && 
                   Number(displayVariant.old_price) > Number(displayVariant.price);

  // Функция для отображения памяти в читаемом формате
  const displayStorage = (storage) => {
    return storage.replace(/ГБ/g, ' ГБ');
  };

  if (loading) {
    return (
      <div className="product-info">
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  return (
    <div className="product-info">
      <h1 className="product-title">
        {getBaseProductName(product.name)}
      </h1>

      {product.brand && (
        <div className="product-brand">
          <span className="text-muted">Бренд: </span>
          <strong>{product.brand}</strong>
        </div>
      )}

      <div className="rating-price-container">
        <div className="rating-section">
          <div className="stars-container">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index}
                  color={index < Math.floor(displayVariant?.rating || 0) ? '#ffc107' : '#e4e5e9'}
                  size={16}
                />
              ))}
            </div>
            <span className="rating-value">{displayVariant?.rating || 0}</span>
          </div>
          <span className="reviews-count">({displayVariant?.reviews_count || 0} отзывов)</span>
        </div>

        <div className="price-section">
          <span className="current-price">
            {(displayVariant?.price || 0).toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && (
            <>
              <span className="old-price">
                {(displayVariant?.old_price || 0).toLocaleString('ru-RU')} ₽
              </span>
              <div className="price-saving">
                Экономия {((displayVariant.old_price - displayVariant.price) / displayVariant.old_price * 100).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      </div>

      {/* Блок выбора параметров показывается только если есть варианты */}
      {hasVariants && (
        <>
          {/* Выбор цвета */}
          {availableColors.length > 0 && (
            <div className="selection-section">
              <h6>
                Цвет: {selectedColor ? (
                  <span className="selected-value">{getColorDisplayName(selectedColor)}</span>
                ) : (
                  <span className="text-muted">Выберите цвет</span>
                )}
              </h6>
              <div className="color-options">
                {availableColors.map((color, index) => {
                  const isSelected = selectedColor === color;
                  const isAvailable = isColorAvailable(color);
                  
                  return (
                    <button
                      key={index}
                      className={`color-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                      onClick={() => isAvailable && handleColorSelect(color)}
                      title={getColorDisplayName(color)}
                      disabled={!isAvailable}
                    >
                      <div 
                        className="color-swatch"
                        style={{ 
                          backgroundColor: getColorHex(color),
                          border: getColorBorder(color)
                        }}
                      />
                      <span className="color-name">{getColorDisplayName(color)}</span>
                      {!isAvailable && <span className="stock-badge">Нет</span>}
                      {isSelected && isAvailable && <FaCheck className="selected-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Выбор объема памяти */}
          {availableStorage.length > 0 && (
            <div className="selection-section">
              <h6>
                Объем памяти: {selectedStorage ? (
                  <span className="selected-value">{displayStorage(selectedStorage)}</span>
                ) : (
                  <span className="text-muted">Выберите объем</span>
                )}
              </h6>
              <div className="storage-options">
                {availableStorage.map((storage, index) => {
                  const isSelected = selectedStorage === storage;
                  const isAvailable = isStorageAvailable(storage);
                  const variantForPrice = variants.find(v => normalizeStorage(getSpecValue(v, 'storage')) === storage);
                  const priceDiff = variantForPrice ? variantForPrice.price - variants[0]?.price : 0;
                  
                  return (
                    <button
                      key={index}
                      className={`storage-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                      onClick={() => isAvailable && handleStorageSelect(storage)}
                      disabled={!isAvailable}
                    >
                      {displayStorage(storage)}
                      {priceDiff > 0 && (
                        <span className="price-diff">+{priceDiff.toLocaleString('ru-RU')} ₽</span>
                      )}
                      {!isAvailable && <span className="stock-badge">Нет</span>}
                      {isSelected && isAvailable && <FaCheck className="selected-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Информация о наличии */}
          <div className="availability">
            {selectedColor && selectedStorage ? (
              exactMatch ? (
                exactMatch.stock > 0 ? (
                  <>
                    <Badge bg="success">В наличии</Badge>
                    <span className="stock-text">Осталось: {exactMatch.stock} шт.</span>
                  </>
                ) : (
                  <>
                    <Badge bg="secondary">Нет в наличии</Badge>
                    <span className="stock-text text-warning">
                      <FaTimes className="me-1" />
                      {getColorDisplayName(selectedColor)} {displayStorage(selectedStorage)} временно отсутствует
                    </span>
                  </>
                )
              ) : (
                <>
                  <Badge bg="secondary">Комбинация недоступна</Badge>
                  <span className="stock-text text-warning">
                    <FaTimes className="me-1" />
                    {getColorDisplayName(selectedColor)} {displayStorage(selectedStorage)} не найдено
                  </span>
                </>
              )
            ) : (
              <>
                <Badge bg="warning">Выберите параметры</Badge>
                <span className="stock-text">
                  {!selectedColor && !selectedStorage && 'Выберите цвет и объем памяти'}
                  {selectedColor && !selectedStorage && 'Выберите объем памяти'}
                  {!selectedColor && selectedStorage && 'Выберите цвет'}
                </span>
              </>
            )}
          </div>
        </>
      )}

      {/* Если нет вариантов, показываем простую информацию о наличии */}
      {!hasVariants && (
        <div className="availability">
          {product.stock > 0 ? (
            <>
              <Badge bg="success">В наличии</Badge>
              <span className="stock-text">Осталось: {product.stock} шт.</span>
            </>
          ) : (
            <>
              <Badge bg="secondary">Нет в наличии</Badge>
              <span className="stock-text text-warning">
                <FaTimes className="me-1" />
                Товар временно отсутствует
              </span>
            </>
          )}
        </div>
      )}

      {/* КНОПКИ */}
      <div className="action-buttons">
        <Button 
          variant="primary" 
          size="lg" 
          disabled={hasVariants ? !canAddToCart : product.stock <= 0}
          className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
          onClick={hasVariants ? handleAddToCart : () => {
            // Логика для товаров без вариантов
            setIsInCart(true);
            setTimeout(() => setIsInCart(false), 2000);
            
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            const itemId = product.id;
            
            const existingItemIndex = cartItems.findIndex(item => item.id === itemId);
            
            if (existingItemIndex >= 0) {
              cartItems[existingItemIndex].quantity += 1;
            } else {
              cartItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.old_price,
                image: product.image_url?.[0] || '',
                quantity: 1,
                slug: product.slug
              });
            }
            
            localStorage.setItem('cart', JSON.stringify(cartItems));
          }}
        >
          <FaShoppingCart className="btn-icon" />
          {isInCart ? 'Добавлено!' : (hasVariants ? 'В корзину' : (product.stock > 0 ? 'В корзину' : 'Нет в наличии'))}
        </Button>
        
        <div className="secondary-buttons">
          <Button 
            variant={isInWishlist ? "danger" : "outline-primary"} 
            className={`wishlist-btn circle-btn ${isInWishlist ? 'added' : ''}`}
            onClick={() => setIsInWishlist(!isInWishlist)}
          >
            {isInWishlist ? <FaHeart /> : <FaRegHeart />}
          </Button>

          <Button 
            variant="outline-secondary" 
            className="share-btn circle-btn"
            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Ссылка скопирована!'))}
          >
            <FaShare />
          </Button>
        </div>
      </div>

      <div className="short-description">
        <p>{displayVariant?.description || 'Описание товара отсутствует'}</p>
      </div>
    </div>
  );
};

// Вспомогательные функции
const getColorHex = (colorName) => {
  const colorMap = {
    'черный': '#000000',
    'белый': '#ffffff',
    'синий': '#007bff',
    'розовый': '#e83e8c',
    'зеленый': '#28a745',
    'красный': '#dc3545',
    'фиолетовый': '#6f42c1',
    'золотой': '#ffd700',
    'серый': '#6c757d',
    'серебристый': '#c0c0c0',
    'phantom black': '#000000',
    'blue': '#007bff',
    'snow': '#ffffff',
    'silver': '#c0c0c0',
    'white': '#ffffff',
    'rococo pearl': '#f0e6ff',
    'black': '#000000',
    'aurora gray': '#a8a8a8'
  };
  return colorMap[colorName.toLowerCase()] || '#6c757d';
};

const getColorDisplayName = (colorName) => {
  const nameMap = {
    'phantom black': 'Черный',
    'snow': 'Белый',
    'white': 'Белый',
    'black': 'Черный',
    'blue': 'Синий',
    'silver': 'Серебристый',
    'rococo pearl': 'Розовый',
    'aurora gray': 'Серый'
  };
  return nameMap[colorName.toLowerCase()] || colorName;
};

const getColorBorder = (colorName) => {
  const lightColors = ['белый', 'серебристый', 'золотой', 'snow', 'white', 'silver'];
  return lightColors.includes(colorName.toLowerCase()) ? '1px solid #ddd' : 'none';
};

export default ProductInfo;