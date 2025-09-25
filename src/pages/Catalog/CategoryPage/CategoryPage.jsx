import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Spinner, 
  Alert, 
  Button,
  Row,
  Col,
  Form,
  Card,
  Accordion
} from 'react-bootstrap';
import { categoryService } from '../../../services/categoryService';
import ProductCard from '../../../components/Products/ProductCard/ProductCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterInStock, setFilterInStock] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoryData, productsData] = await Promise.all([
          categoryService.getCategoryBySlug(slug),
          categoryService.getProductsByCategory(slug)
        ]);
        setCategory(categoryData);
        setProducts(productsData);
      } catch (err) {
        setError('Ошибка загрузки данных категории');
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Извлекаем все возможные характеристики из товаров
  const getAllSpecifications = () => {
    const specs = {};
    
    products.forEach(product => {
      if (product.specifications && typeof product.specifications === 'string') {
        try {
          const parsedSpecs = JSON.parse(product.specifications);
          Object.entries(parsedSpecs).forEach(([key, value]) => {
            if (!specs[key]) {
              specs[key] = new Set();
            }
            if (value !== null && value !== undefined && value !== '') {
              specs[key].add(value.toString());
            }
          });
        } catch (e) {
          console.error('Error parsing specifications:', e);
        }
      }
    });

    // Преобразуем Set в массив и сортируем
    const result = {};
    Object.keys(specs).forEach(key => {
      result[key] = Array.from(specs[key]).sort();
    });
    
    return result;
  };

  const specifications = getAllSpecifications();

  // Получаем уникальные бренды
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  // Находим максимальную цену для диапазона
  const maxPrice = products.length > 0 
    ? Math.max(...products.map(p => p.price)) 
    : 500000;

  // Функция для проверки соответствия товара фильтрам
  const productMatchesFilters = (product) => {
    // Фильтр по наличию
    if (filterInStock && product.stock <= 0) return false;

    // Фильтр по цене
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

    // Фильтр по брендам
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

    // Фильтр по характеристикам
    if (Object.keys(filters).length > 0) {
      try {
        const productSpecs = product.specifications 
          ? typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications) 
            : product.specifications
          : {};

        for (const [key, values] of Object.entries(filters)) {
          if (values.length > 0) {
            const productValue = productSpecs[key];
            if (!productValue || !values.includes(productValue.toString())) {
              return false;
            }
          }
        }
      } catch (e) {
        console.error('Error checking specifications filter:', e);
        return false;
      }
    }

    return true;
  };

  const filteredAndSortedProducts = products
    .filter(productMatchesFilters)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Обработчики фильтров
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleSpecificationToggle = (specKey, value) => {
    setFilters(prev => {
      const currentValues = prev[specKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [specKey]: newValues
      };
    });
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value) || 0;
    setPriceRange(newRange);
  };

  const clearAllFilters = () => {
    setFilterInStock(false);
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setFilters({});
  };

  const getDisplayName = (key) => {
    const nameMap = {
      'os': 'Операционная система',
      'ram': 'Оперативная память',
      'storage': 'Встроенная память',
      'screen_size': 'Размер экрана',
      'camera': 'Камера',
      'battery': 'Аккумулятор',
      'processor': 'Процессор',
      'color': 'Цвет',
      'waterproof': 'Защита от воды',
      'refresh_rate': 'Частота обновления',
      'wireless_charge': 'Беспроводная зарядка',
      'nfc': 'NFC',
      '5g': '5G',
      'display': 'Тип дисплея',
      'network': 'Сети',
      'material': 'Материал',
      'security': 'Безопасность'
    };
    return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка товаров...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Ошибка!</Alert.Heading>
          <p>{error}</p>
          <Button as={Link} to="/catalog" variant="outline-danger">
            Вернуться к категориям
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Категория не найдена</Alert.Heading>
          <p>Категория с slug "{slug}" не существует</p>
          <Button as={Link} to="/catalog" variant="outline-warning">
            Вернуться к категориям
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="category-page">
      {/* Заголовок категории */}
      <div className="category-header">
        <h1 className="category-title">{category.name}</h1>
        <p className="category-description">{category.description}</p>
        <div className="products-count">
          Найдено товаров: {filteredAndSortedProducts.length} из {products.length}
        </div>
      </div>

      {/* Основной контент с фильтрами и товарами */}
      <Row>
        {/* Боковая панель с фильтрами */}
        <Col lg={3} className="filters-sidebar">
          <Card className="filters-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Фильтры</h5>
              <Button 
                variant="link" 
                size="sm" 
                onClick={clearAllFilters}
                className="p-0 text-decoration-none text-primary"
              >
                Сбросить все
              </Button>
            </Card.Header>
            
            <Card.Body>
              {/* Переключатель показа фильтров для мобильных */}
              <div className="d-lg-none mb-3">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-100"
                >
                  {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </Button>
              </div>

              <div className={!showFilters ? 'd-none d-lg-block' : ''}>
                {/* Фильтр по наличию */}
                <div className="filter-group">
                  <div className="switch-container">
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="stock-filter"
                        checked={filterInStock}
                        onChange={(e) => setFilterInStock(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="switch-label">Только в наличии</span>
                  </div>
                </div>

                {/* Фильтр по цене */}
                <div className="filter-group">
                  <h6>Цена, ₽</h6>
                  <div className="price-inputs d-flex gap-2 mb-2">
                    <Form.Control
                      type="number"
                      placeholder="От"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      min="0"
                      max={maxPrice}
                    />
                    <Form.Control
                      type="number"
                      placeholder="До"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      min="0"
                      max={maxPrice}
                    />
                  </div>
                  <div className="price-range-info text-muted small">
                    Диапазон: 0 - {maxPrice.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                {/* Фильтр по брендам */}
                {brands.length > 0 && (
                  <div className="filter-group">
                    <h6>Бренды ({selectedBrands.length})</h6>
                    <div className="brands-list">
                      {brands.map(brand => (
                        <Form.Check
                          key={brand}
                          type="checkbox"
                          id={`brand-${brand}`}
                          label={brand}
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="mb-2"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Фильтры по характеристикам */}
                {Object.keys(specifications).length > 0 && (
                  <div className="filter-group">
                    <h6>Характеристики</h6>
                    <Accordion flush>
                      {Object.entries(specifications).map(([key, values]) => (
                        <Accordion.Item key={key} eventKey={key}>
                          <Accordion.Header>
                            {getDisplayName(key)} 
                            {(filters[key] && filters[key].length > 0) && (
                              <span className="badge bg-primary ms-2">
                                {filters[key].length}
                              </span>
                            )}
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="specs-list">
                              {values.map(value => (
                                <Form.Check
                                  key={value}
                                  type="checkbox"
                                  id={`${key}-${value}`}
                                  label={value}
                                  checked={(filters[key] || []).includes(value)}
                                  onChange={() => handleSpecificationToggle(key, value)}
                                  className="mb-2"
                                />
                              ))}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Основной контент с товарами */}
        <Col lg={9}>
          {/* Панель сортировки и информации */}
          <div className="filters-section">
            <div className="filters-container">
              <div className="filter-group">
                <label className="filter-label" htmlFor="sort-select">Сортировка</label>
                <select 
                  id="sort-select"
                  aria-label="Сортировка товаров"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select-custom"
                >
                  <option value="name">По названию</option>
                  <option value="price-asc">Цена по возрастанию</option>
                  <option value="price-desc">Цена по убыванию</option>
                  <option value="rating">По рейтингу</option>
                  <option value="newest">Сначала новинки</option>
                </select>
              </div>

              <div className="filter-group back-button">
                <Link to="/catalog" className="btn-back-custom">
                  ← Все категории
                </Link>
              </div>
            </div>
          </div>

          {/* Список товаров */}
          <div className="products-section">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="no-products-alert">
                <h4>Товары не найдены</h4>
                <p>
                  {products.length === 0 
                    ? 'В этой категории пока нет товаров'
                    : 'Попробуйте изменить параметры фильтров'
                  }
                </p>
                <Link to="/catalog" className="back-to-categories-btn">
                  Посмотреть другие категории
                </Link>
              </div>
            ) : (
              <div className="products-grid">
                {filteredAndSortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CategoryPage;