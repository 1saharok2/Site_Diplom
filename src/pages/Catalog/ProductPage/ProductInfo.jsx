import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaShare, FaStar, FaRegHeart, FaCheck, FaTimes } from 'react-icons/fa';
import { categoryService } from '../../../services/categoryService';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import './ProductPage_css/ProductInfo.css';

// Вспомогательные функции вынесены наружу для предотвращения пересоздания
const getColorHex = (colorName) => {
  const colorMap = {
    'черный': '#000000', 'белый': '#ffffff', 'синий': '#007bff', 'розовый': '#e83e8c',
    'зеленый': '#28a745', 'красный': '#dc3545', 'фиолетовый': '#6f42c1', 'золотой': '#ffd700',
    'серый': '#6c757d', 'серебристый': '#c0c0c0', 'phantom black': '#000000', 'blue': '#007bff',
    'snow': '#ffffff', 'silver': '#c0c0c0', 'white': '#ffffff', 'rococo pearl': '#f0e6ff',
    'black': '#000000', 'aurora gray': '#a8a8a8'
  };
  return colorMap[colorName.toLowerCase()] || '#6c757d';
};

const getColorDisplayName = (colorName) => {
  const nameMap = {
    'phantom black': 'Черный', 'snow': 'Белый', 'white': 'Белый', 'black': 'Черный',
    'blue': 'Синий', 'silver': 'Серебристый', 'rococo pearl': 'Розовый', 'aurora gray': 'Серый'
  };
  return nameMap[colorName.toLowerCase()] || colorName;
};

const getColorBorder = (colorName) => {
  const lightColors = ['белый', 'серебристый', 'золотой', 'snow', 'white', 'silver'];
  return lightColors.includes(colorName.toLowerCase()) ? '1px solid #ddd' : 'none';
};

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

const normalizeColor = (color) => {
  if (!color) return '';
  return color.toString().toLowerCase().trim();
};

const getBaseProductName = (productName) => {
  let baseName = productName
    .replace(/\s*(128GB|256GB|512GB|\d+GB|128 ГБ|256 ГБ|512 ГБ|\d+ ГБ)\s*$/gi, '')
    .replace(/\s*(Черный|Белый|Розовый|Синий|Blue|White|Pink|Black|Phantom Black|Snow|Silver|Rococo Pearl|Aurora Gray)\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (baseName.includes('Apple iPhone 16')) baseName = 'Apple iPhone 16';
  if (baseName.includes('Samsung Galaxy')) baseName = baseName.replace(/\s*Ultra\s*$/, '').trim();
  
  return baseName;
};

const ProductInfo = ({ product, onVariantChange }) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const {
    addToWishlist,
    removeFromWishlistByProduct,
    isInWishlist: checkInWishlist
  } = useWishlist();

  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(product);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [exactMatch, setExactMatch] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const userId = useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    if (currentUser?.user_id) return currentUser.user_id;
    if (currentUser?.userId) return currentUser.userId;

    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        return (
          parsed?.id ||
          parsed?.user_id ||
          parsed?.userId ||
          null
        );
      } catch (error) {
        console.error('Ошибка чтения userData:', error);
      }
    }

    const storedId = localStorage.getItem('user_id');
    return storedId || null;
  }, [currentUser]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('user_id');
    }
  }, [userId]);

  // Мемоизированные функции
  const getSpecValue = useCallback((variant, key) => {
    const specs = normalizeSpecifications(variant.specifications);
    return specs[key] || '';
  }, []);

  // Загрузка вариантов товара
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product?.name) return;
      
      setLoading(true);
      try {
        const baseName = getBaseProductName(product.name);
        const cacheKey = `variants_${baseName}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const cachedVariants = JSON.parse(cached);
          setVariants(cachedVariants);
        } else {
          try {
            const allProducts = await categoryService.getAllProducts();
            const productVariants = allProducts.filter(p => {
              const productBaseName = getBaseProductName(p.name);
              return productBaseName === baseName && p.id !== product.id;
            });
            
            const variantsData = [product, ...productVariants];
            setVariants(variantsData);
            sessionStorage.setItem(cacheKey, JSON.stringify(variantsData));
          } catch (apiError) {
            console.log('API недоступен, используем только текущий товар');
            setVariants([product]);
          }
        }
        
        // Устанавливаем начальные значения
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
        setVariants([product]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [product]);

  // Мемоизированные доступные цвета и объемы
  const availableColors = useMemo(() => 
    [...new Set(variants
      .map(v => {
        const color = normalizeColor(getSpecValue(v, 'color'));
        return color && color.trim() !== '' ? color : null;
      })
      .filter(color => color !== null)
    )],
    [variants, getSpecValue]
  );

  const availableStorage = useMemo(() => 
    [...new Set(variants
      .map(v => {
        const storage = normalizeStorage(getSpecValue(v, 'storage'));
        return storage && storage.trim() !== '' ? storage : null;
      })
      .filter(storage => storage !== null)
    )],
    [variants, getSpecValue]
  );

  const hasVariants = useMemo(() => 
    availableColors.length > 0 || availableStorage.length > 0,
    [availableColors, availableStorage]
  );

  // Мемоизированные проверки доступности
  const isColorAvailable = useCallback((color) => {
    const normalizedColor = normalizeColor(color);
    return variants.some(v => 
      normalizeColor(getSpecValue(v, 'color')) === normalizedColor && 
      v.stock > 0
    );
  }, [variants, getSpecValue]);

  const isStorageAvailable = useCallback((storage) => {
    const normalizedStorage = normalizeStorage(storage);
    return variants.some(v => 
      normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage && 
      v.stock > 0
    );
  }, [variants, getSpecValue]);

  // Обработчики выбора
  const handleColorSelect = useCallback((color) => {
    const normalizedColor = normalizeColor(color);
    setSelectedColor(normalizedColor);
    
    let match = null;
    if (selectedStorage) {
      match = variants.find(v => 
        normalizeColor(getSpecValue(v, 'color')) === normalizedColor && 
        normalizeStorage(getSpecValue(v, 'storage')) === selectedStorage
      );
    }
    
    if (!match) {
      match = variants.find(v => 
        normalizeColor(getSpecValue(v, 'color')) === normalizedColor
      );
    }
    
    if (match) {
      setSelectedVariant(match);
      onVariantChange?.(match);
      
      const matchStorage = normalizeStorage(getSpecValue(match, 'storage'));
      if (matchStorage && matchStorage !== selectedStorage) {
        setSelectedStorage(matchStorage);
      }
    }
  }, [selectedStorage, variants, getSpecValue, onVariantChange]);

  const handleStorageSelect = useCallback((storage) => {
    const normalizedStorage = normalizeStorage(storage);
    setSelectedStorage(normalizedStorage);
    
    let match = null;
    if (selectedColor) {
      match = variants.find(v => 
        normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage && 
        normalizeColor(getSpecValue(v, 'color')) === selectedColor
      );
    }
    
    if (!match) {
      match = variants.find(v => 
        normalizeStorage(getSpecValue(v, 'storage')) === normalizedStorage
      );
    }
    
    if (match) {
      setSelectedVariant(match);
      onVariantChange?.(match);
      
      const matchColor = normalizeColor(getSpecValue(match, 'color'));
      if (matchColor && matchColor !== selectedColor) {
        setSelectedColor(matchColor);
      }
    }
  }, [selectedColor, variants, getSpecValue, onVariantChange]);

  // Поиск точного совпадения
  useEffect(() => {
    if (variants.length > 0) {
      let foundExactMatch = null;
      
      if (selectedColor && selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vColor = normalizeColor(vSpecs.color);
          const vStorage = normalizeStorage(vSpecs.storage);
          return vColor === selectedColor && vStorage === selectedStorage;
        });
      } else if (selectedColor && !selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vColor = normalizeColor(vSpecs.color);
          return vColor === selectedColor;
        });
      } else if (!selectedColor && selectedStorage) {
        foundExactMatch = variants.find(v => {
          const vSpecs = normalizeSpecifications(v.specifications);
          const vStorage = normalizeStorage(vSpecs.storage);
          return vStorage === selectedStorage;
        });
      }
      
      setExactMatch(foundExactMatch || null);
      
      if (foundExactMatch && foundExactMatch.id !== selectedVariant.id) {
        setSelectedVariant(foundExactMatch);
        onVariantChange?.(foundExactMatch);
      }
    } else {
      setExactMatch(null);
    }
  }, [selectedColor, selectedStorage, variants, onVariantChange, selectedVariant.id]);

  // Мемоизированные значения для отображения
  const displayStorage = useCallback((storage) => {
    return storage.replace(/ГБ/g, ' ГБ');
  }, []);

  const targetProduct = useMemo(() => {
    if (hasVariants) {
      return exactMatch || selectedVariant || product;
    }
    return product;
  }, [hasVariants, exactMatch, selectedVariant, product]);

  const handleAddToCart = useCallback(async () => {
    if (!targetProduct || targetProduct.stock <= 0) return;
    if (!userId) {
      alert('Пожалуйста, войдите в аккаунт, чтобы добавить товар в корзину.');
      return;
    }

    try {
      setCartLoading(true);
      setIsInCart(true);
      await addToCart(targetProduct.id, 1);
      setTimeout(() => setIsInCart(false), 2000);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Не удалось добавить товар в корзину');
      setIsInCart(false);
    } finally {
      setCartLoading(false);
    }
  }, [targetProduct, userId, addToCart]);

  const targetProductId = targetProduct?.id;

  useEffect(() => {
    if (!targetProductId) {
      setIsInWishlistState(false);
      return;
    }
    setIsInWishlistState(checkInWishlist(targetProductId));
  }, [targetProductId, checkInWishlist]);

  const handleWishlistToggle = useCallback(async () => {
    if (!targetProductId) return;

    if (!userId) {
      alert('Пожалуйста, войдите в аккаунт, чтобы сохранять товары в избранное.');
      return;
    }

    try {
      setWishlistLoading(true);

      if (isInWishlistState) {
        await removeFromWishlistByProduct(targetProductId);
        setIsInWishlistState(false);
      } else {
        await addToWishlist(targetProductId);
        setIsInWishlistState(true);
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      alert('Не удалось обновить избранное. Попробуйте позже.');
    } finally {
      setWishlistLoading(false);
    }
  }, [userId, targetProductId, isInWishlistState, addToWishlist, removeFromWishlistByProduct]);
  const canAddToCart = targetProduct ? targetProduct.stock > 0 : false;
  const displayVariant = targetProduct || selectedVariant;
  const hasDiscount = displayVariant?.old_price && displayVariant?.price && 
                   Number(displayVariant.old_price) > Number(displayVariant.price);

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

      {/* Блок выбора параметров */}
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

      {/* Простая информация о наличии если нет вариантов */}
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
          disabled={!canAddToCart || cartLoading}
          className={`add-to-cart-btn ${isInCart ? 'added' : ''}`}
          onClick={handleAddToCart}
        >
          <FaShoppingCart className="btn-icon" />
          {cartLoading
            ? 'Добавление...'
            : isInCart
              ? 'Добавлено!'
              : (hasVariants ? 'В корзину' : (product.stock > 0 ? 'В корзину' : 'Нет в наличии'))}
        </Button>
        
        <div className="secondary-buttons">
          <Button 
            variant={isInWishlistState ? "danger" : "outline-primary"} 
            className={`wishlist-btn circle-btn ${isInWishlistState ? 'added' : ''}`}
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            {isInWishlistState ? <FaHeart /> : <FaRegHeart />}
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

export default React.memo(ProductInfo);