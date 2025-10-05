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
  Badge
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
  const [expandedSpecs, setExpandedSpecs] = useState({});

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
        
        if (productsData.length > 0) {
          const maxPrice = Math.max(...productsData.map(p => p.price));
          setPriceRange([0, maxPrice]);
        }
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

    const result = {};
    Object.keys(specs).forEach(key => {
      result[key] = Array.from(specs[key]).sort();
    });
    
    return result;
  };

  const specifications = getAllSpecifications();
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const maxPrice = products.length > 0 
    ? Math.max(...products.map(p => p.price)) 
    : 500000;

  const productMatchesFilters = (product) => {
    if (filterInStock && product.stock <= 0) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

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

  const toggleSpecExpanded = (specKey) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specKey]: !prev[specKey]
    }));
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterInStock) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    count += selectedBrands.length;
    Object.values(filters).forEach(values => {
      count += values.length;
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
      <div className="category-header">
        <h1 className="category-title">{category.name}</h1>
        <p className="category-description">{category.description}</p>
        <div className="products-count">
          Найдено товаров: {filteredAndSortedProducts.length} из {products.length}
          {activeFiltersCount > 0 && (
            <Badge bg="warning" text="dark" className="ms-2">
              Активных фильтров: {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>

      <Row>
        {/* Левая колонка - все фильтры и сортировка */}
        <Col lg={3} className="filters-sidebar">
          {/* Блок сортировки */}
          <Card className="sorting-card mb-3">
            <Card.Header>
              <h5 className="mb-0">Сортировка</h5>
            </Card.Header>
            <Card.Body>
              <div className="sorting-group">
                <label className="sorting-label" htmlFor="sort-select">
                  Сортировать по:
                </label>
                <select 
                  id="sort-select"
                  aria-label="Сортировка товаров"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select-custom"
                >
                  <option value="name">По названию</option>
                  <option value="price-asc">Цена по возрастанию</option>
                  <option value="price-desc">Цена по убыванию</option>
                  <option value="rating">По рейтингу</option>
                  <option value="newest">Сначала новинки</option>
                </select>
              </div>
            </Card.Body>
          </Card>

          {/* Основные фильтры */}
          <Card className="filters-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Фильтры</h5>
              <div className="d-flex align-items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge bg="primary" className="me-2">
                    {activeFiltersCount}
                  </Badge>
                )}
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="p-0 text-decoration-none text-primary"
                  disabled={activeFiltersCount === 0}
                >
                  Сбросить все
                </Button>
              </div>
            </Card.Header>
            
            <Card.Body>
              <div className="d-lg-none mb-3">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-100 d-flex justify-content-between align-items-center"
                >
                  <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
                  <Badge bg="primary">{activeFiltersCount}</Badge>
                </Button>
              </div>

              <div className={!showFilters ? 'd-none d-lg-block' : ''}>
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

                <div className="filter-group">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>Цена, ₽</h6>
                    <span className="price-range-value">
                      {priceRange[0].toLocaleString('ru-RU')} - {priceRange[1].toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className="price-inputs d-flex gap-2">
                    <Form.Control
                      type="number"
                      placeholder="От"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      min="0"
                      max={maxPrice}
                      size="sm"
                    />
                    <Form.Control
                      type="number"
                      placeholder="До"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      min="0"
                      max={maxPrice}
                      size="sm"
                    />
                  </div>
                </div>

                {brands.length > 0 && (
                  <div className="filter-group">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6>Бренды</h6>
                      {selectedBrands.length > 0 && (
                        <Badge bg="primary">{selectedBrands.length}</Badge>
                      )}
                    </div>
                    <div className="brands-list">
                      {brands.map(brand => (
                        <div key={brand} className="brand-item">
                          <Form.Check
                            type="checkbox"
                            id={`brand-${brand}`}
                            label={brand}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(specifications).length > 0 && (
                  <div className="filter-group">
                    <h6 className="specifications-title">
                      Характеристики
                      {Object.values(filters).flat().length > 0 && (
                        <Badge bg="primary" className="ms-2">
                          {Object.values(filters).flat().length}
                        </Badge>
                      )}
                    </h6>
                    <div className="specifications-list">
                      {Object.entries(specifications).map(([key, values]) => (
                        <div key={key} className="specification-category">
                          <div 
                            className="spec-category-header"
                            onClick={() => toggleSpecExpanded(key)}
                          >
                            <div className="spec-category-title">
                              <span className="spec-icon">⚙️</span>
                              {getDisplayName(key)}
                              {(filters[key] && filters[key].length > 0) && (
                                <Badge bg="primary" className="ms-2">
                                  {filters[key].length}
                                </Badge>
                              )}
                            </div>
                            <div className={`spec-category-arrow ${expandedSpecs[key] ? 'expanded' : ''}`}>
                              ▼
                            </div>
                          </div>
                          
                          {expandedSpecs[key] && (
                            <div className="spec-category-values">
                              {values.map(value => (
                                <div key={value} className="spec-value-option">
                                  <input
                                    type="checkbox"
                                    id={`${key}-${value}`}
                                    checked={(filters[key] || []).includes(value)}
                                    onChange={() => handleSpecificationToggle(key, value)}
                                    className="spec-checkbox"
                                  />
                                  <label 
                                    htmlFor={`${key}-${value}`}
                                    className="spec-value-label"
                                  >
                                    <span className="spec-value-text">{value}</span>
                                    <span className="spec-checkmark"></span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Кнопка возврата */}
          <div className="back-button-container mt-3">
            <Link to="/catalog" className="btn-back-custom w-100 text-center">
              ← Все категории
            </Link>
          </div>
        </Col>

        {/* Правая колонка - только товары */}
        <Col lg={9}>
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
                <Button 
                  variant="primary" 
                  onClick={clearAllFilters}
                  className="me-2"
                >
                  Сбросить фильтры
                </Button>
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