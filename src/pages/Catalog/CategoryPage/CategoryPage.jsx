import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { aggregateSpecifications, productMatchesFacetFilters } from '../../../services/filterService';
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

  // Мемоизированная обработка продуктов
  const processedProducts = useMemo(() => {
    return products.map(product => {
      let parsedSpecs = {};
      try {
        parsedSpecs = product.specifications
          ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications)
          : {};
      } catch (e) {
        parsedSpecs = {};
      }
      return { ...product, parsedSpecs };
    });
  }, [products]);

  // Facets used by FiltersCard + consistent matching.
  const { specifications, specificationsCountMap } = useMemo(() => {
    return aggregateSpecifications(processedProducts);
  }, [processedProducts]);
  // Мемоизированные вычисления
  const brands = useMemo(() => 
    [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), 
    [products]
  );
  
  const maxPrice = useMemo(() => 
    products.length > 0 ? Math.max(...products.map(p => p.price)) : 500000,
    [products]
  );

  // Мемоизированная функция для подсчета товаров по брендам
  const getBrandCount = useCallback((brand) => {
    return products.filter(p => p.brand === brand).length;
  }, [products]);

  // Мемоизированная функция фильтрации
  const productMatchesFilters = useCallback((product) => {
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

    // Фильтр по характеристикам - единая нормализация + derived ключи
    if (Object.keys(filters).length > 0) {
      if (!productMatchesFacetFilters(product, filters)) return false;
    }

    return true;
  }, [availabilityFilter, filterInStock, priceRange, selectedBrands, minRating, hasReview, reliableModels, filters]);

  // Мемоизированная фильтрация и сортировка
  const filteredAndSortedProducts = useMemo(() => {
    return processedProducts
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
  }, [processedProducts, productMatchesFilters, sortBy]);

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
      'screen_size_range': 'Размер экрана',
      'camera': 'Камера',
      'camera_count_bucket': 'Количество камер',
      'battery': 'Аккумулятор',
      'battery_capacity_bucket': 'Емкость аккумулятора',
      'processor': 'Процессор',
      'cpu_cores': 'Кол-во ядер',
      'processor_company': 'Производитель процессора',
      'color': 'Цвет',
      'waterproof': 'Защита от воды',
      'wireless_charge_support': 'Беспроводная зарядка',
      'refresh_rate': 'Частота обновления',
      'resolution_class': 'Разрешение',
      'video_recording': 'Запись видео',
      'supports_5g': 'Поддержка 5G',
      'fast_charge_range': 'Быстрая зарядка',
      'wireless_charge': 'Беспроводная зарядка',
      'nfc': 'NFC',
      '5g': '5G',
      'display': 'Тип дисплея',
      'network': 'Сети',
      'material': 'Материал',
      'material_basic': 'Материал',
      'security': 'Безопасность'
    };
    return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Оптимизированная функция подсчета
  const getSpecificationCount = useCallback((key, value) => {
    return specificationsCountMap.get(`${key}-${value}`) || 0;
  }, [specificationsCountMap]);

  // Мемоизированный подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
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
  }, [filterInStock, priceRange, maxPrice, selectedBrands, filters, availabilityFilter, minRating, reliableModels, hasReview]);

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

          {/* Кнопка возврата удалена по требованию */}
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