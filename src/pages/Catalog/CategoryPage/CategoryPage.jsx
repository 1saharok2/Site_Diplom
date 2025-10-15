import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Spinner, 
  Alert, 
  Button,
  Row,
  Col
} from 'react-bootstrap';
import { categoryService } from '../../../services/categoryService';
import ProductCard from '../../../components/Products/ProductCard/ProductCard';
import SortingCard from './SortingCard';
import FiltersCard from './FiltersCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Состояния фильтров
  const [filterInStock, setFilterInStock] = useState(true); // Изменено на true по умолчанию
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Новые состояния для фильтров
  const [availabilityFilter, setAvailabilityFilter] = useState('availability-all');
  const [minRating, setMinRating] = useState(null);
  const [reliableModels, setReliableModels] = useState(false);
  const [hasReview, setHasReview] = useState(false);

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

  // Функция для подсчета товаров по брендам
  const getBrandCount = (brand) => {
    return products.filter(p => p.brand === brand).length;
  };

  const productMatchesFilters = (product) => {
    // Фильтр по наличию в магазинах
    if (availabilityFilter === 'availability-instock' && product.stock <= 0) return false;
    if (availabilityFilter === 'availability-out' && product.stock > 0) return false;

    // Фильтр по наличию (старый фильтр)
    if (filterInStock && product.stock <= 0) return false;
    
    // Фильтр по цене
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    
    // Фильтр по брендам
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

    // Фильтр по рейтингу
    if (minRating !== null && product.rating < minRating) return false;

    // Фильтр по наличию отзывов
    if (hasReview && (!product.reviewsCount || product.reviewsCount === 0)) return false;

    // Фильтр по новым моделям
    if (reliableModels && !product.isNew) return false;

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

  const clearAllFilters = () => {
    setFilterInStock(true); // Сбрасываем к значению по умолчанию (true)
    setPriceRange([0, maxPrice]);
    setSelectedBrands([]);
    setFilters({});
    setAvailabilityFilter('availability-all');
    setMinRating(null);
    setReliableModels(false);
    setHasReview(false);
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

  const getSpecificationCount = (key, value) => {
    return products.filter(p => {
      try {
        const specs = p.specifications ? 
          (typeof p.specifications === 'string' ? 
            JSON.parse(p.specifications) : p.specifications) : {};
        return specs[key] === value;
      } catch {
        return false;
      }
    }).length;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterInStock) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    count += selectedBrands.length;
    Object.values(filters).forEach(values => {
      count += values.length;
    });
    if (availabilityFilter !== 'availability-all') count++;
    if (minRating !== null) count++;
    if (reliableModels) count++;
    if (hasReview) count++;
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
      <Row>
        {/* Левая колонка - фильтры */}
        <Col lg={3} className="filters-column">
          {/* Sticky контейнер для фильтров */}
          <div className="sticky-filters">
            <FiltersCard
              filterInStock={filterInStock}
              setFilterInStock={setFilterInStock}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              filters={filters}
              setFilters={setFilters}
              brands={brands}
              specifications={specifications}
              getDisplayName={getDisplayName}
              clearAllFilters={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              getSpecificationCount={getSpecificationCount}
              maxPrice={maxPrice}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              // Новые пропсы для фильтров
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              minRating={minRating}
              setMinRating={setMinRating}
              reliableModels={reliableModels}
              setReliableModels={setReliableModels}
              hasReview={hasReview}
              setHasReview={setHasReview}
              getBrandCount={getBrandCount}
            />
          </div>

          {/* Кнопка возврата - ВНЕ sticky контейнера */}
          <div className="back-button-container mt-5">
            <Link to="/catalog" className="btn-back-custom w-100 text-center">
              ← Все категории
            </Link>
          </div>
        </Col>

        {/* Правая колонка - сортировка и товары */}
        <Col lg={9} className="products-column">
          {/* Сортировка над товарами */}
          <SortingCard sortBy={sortBy} setSortBy={setSortBy} />

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