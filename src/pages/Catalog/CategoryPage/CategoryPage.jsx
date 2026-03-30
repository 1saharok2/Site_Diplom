import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Spinner, 
  Alert, 
  Button,
  Row,
  Col,
  Offcanvas
} from 'react-bootstrap';
import { categoryService, getCategoryFilters } from '../../../services/categoryService';
import {
  aggregateSpecifications,
  productMatchesFacetFilters,
  PRICE_FILTER_CEILING
} from '../../../services/filterService';
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 992px)').matches : true)
  );
  const offcanvasContainer = typeof window !== 'undefined' ? window.document.body : undefined;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Дополнительно фиксируем слой offcanvas/backdrop через inline-стили в runtime.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!mobileFiltersOpen) return;

    const offcanvasEl = document.querySelector('.category-filters-offcanvas.offcanvas');
    const backdropEl = document.querySelector('.offcanvas-backdrop.show');
    if (offcanvasEl) offcanvasEl.style.zIndex = '2000002';
    if (backdropEl) backdropEl.style.zIndex = '2000001';
  }, [mobileFiltersOpen]);
  
  // Новые состояния для фильтров
  const [availabilityFilter, setAvailabilityFilter] = useState('availability-all');
  const [minRating, setMinRating] = useState(null);
  const [reliableModels, setReliableModels] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  // Серверные фасеты (если доступны)
  const [serverSpecifications, setServerSpecifications] = useState(null);
  const [serverSpecificationsCountMap, setServerSpecificationsCountMap] = useState(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const resetCategoryViewState = () => {
      setError('');
      setCategory(null);
      setProducts([]);
      setServerSpecifications(null);
      setServerSpecificationsCountMap(null);
      setFilterInStock(true);
      setPriceRange([0, 500000]);
      setSelectedBrands([]);
      setFilters({});
      setAvailabilityFilter('availability-all');
      setMinRating(null);
      setReliableModels(false);
      setHasReview(false);
      setSortBy('name');
      setMobileFiltersOpen(false);
    };

    setLoading(true);
    resetCategoryViewState();

    const fetchData = async () => {
      try {
        const [categoryData, productsData] = await Promise.all([
          categoryService.getCategoryBySlug(slug),
          categoryService.getProductsByCategory(slug),
        ]);
        if (cancelled) return;

        setCategory(categoryData);
        setProducts(productsData);

        if (productsData.length > 0) {
          const maxP = Math.max(...productsData.map((p) => p.price));
          setPriceRange([0, maxP]);
        } else {
          setPriceRange([0, 500000]);
        }

        try {
          const filtersData = await getCategoryFilters(slug);
          if (cancelled) return;
          if (filtersData?.specifications && filtersData?.counts) {
            setServerSpecifications(filtersData.specifications);
            setServerSpecificationsCountMap(filtersData.counts);
          } else {
            setServerSpecifications(null);
            setServerSpecificationsCountMap(null);
          }
        } catch (e) {
          if (!cancelled) {
            console.error('Error fetching category filters:', e);
            setServerSpecifications(null);
            setServerSpecificationsCountMap(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Ошибка загрузки данных категории');
          console.error('Error fetching category data:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
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

  // Facets: клиентская агрегация (производные поля DNS) + дополнение от сервера при наличии
  const { specifications, specificationsCountMap } = useMemo(() => {
    const client = aggregateSpecifications(processedProducts);
    if (!serverSpecifications || !serverSpecificationsCountMap) {
      return client;
    }
    const mergedSpecs = { ...serverSpecifications };
    Object.entries(client.specifications).forEach(([key, vals]) => {
      if (!mergedSpecs[key]?.length) mergedSpecs[key] = vals;
    });
    const mergedMap = new Map();
    Object.entries(serverSpecificationsCountMap).forEach(([key, count]) => {
      mergedMap.set(key, count);
    });
    client.specificationsCountMap.forEach((count, mapKey) => {
      if (!mergedMap.has(mapKey)) mergedMap.set(mapKey, count);
    });
    return { specifications: mergedSpecs, specificationsCountMap: mergedMap };
  }, [processedProducts, serverSpecifications, serverSpecificationsCountMap]);
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

  const getDisplayName = useCallback((key) => {
    const nameMap = {
      storage_gb: 'Объем встроенной памяти (ГБ)',
      storage: 'Объем встроенной памяти (ГБ)',
      ram_gb: 'Объем оперативной памяти (ГБ)',
      ram: 'Объем оперативной памяти (ГБ)',
      product_model: 'Модель',
      model: 'Модель',
      os: 'Операционная система',
      release_year: 'Год релиза',
      battery_capacity_bucket: 'Емкость аккумулятора (мА*ч)',
      nfc: 'NFC',
      screen_size_range: 'Диагональ экрана (дюйм)',
      screen_diagonal_inch: 'Диагональ экрана (дюйм)',
      screen_size: 'Диагональ экрана (дюйм)',
      ip_rating: 'Степень защиты IP',
      waterproof: 'Степень защиты IP',
      refresh_rate: 'Частота обновления экрана (Гц)',
      processor: 'Модель процессора',
      camera: 'Камера',
      camera_count_bucket: 'Количество камер',
      battery: 'Аккумулятор',
      cpu_cores: 'Кол-во ядер',
      processor_company: 'Производитель процессора',
      color: 'Цвет',
      wireless_charge_support: 'Беспроводная зарядка',
      resolution_class: 'Разрешение',
      video_recording: 'Video',
      supports_5g: 'Поддержка 5G',
      fast_charge_range: 'Fast Charge',
      wireless_charge: 'Беспроводная зарядка',
      '5g': '5G',
      display: 'Тип дисплея',
      network: 'Сети',
      material: 'Материал',
      material_basic: 'Материал',
      security: 'Безопасность'
    };
    return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const filterChips = useMemo(() => {
    const chips = [];
    if (!filterInStock) {
      chips.push({
        key: 'stock',
        label: 'Включая не в наличии',
        onRemove: () => setFilterInStock(true)
      });
    }
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      chips.push({
        key: 'price',
        label: `Цена: ${Number(priceRange[0]).toLocaleString('ru-RU')}–${Number(priceRange[1]).toLocaleString('ru-RU')} ₽`,
        onRemove: () => setPriceRange([0, maxPrice])
      });
    }
    selectedBrands.forEach((b) => {
      chips.push({
        key: `brand-${b}`,
        label: String(b),
        onRemove: () => setSelectedBrands((prev) => prev.filter((x) => x !== b))
      });
    });
    Object.entries(filters).forEach(([specKey, values]) => {
      (values || []).forEach((val) => {
        chips.push({
          key: `spec-${specKey}-${val}`,
          label: `${getDisplayName(specKey)}: ${val}`,
          onRemove: () =>
            setFilters((prev) => {
              const cur = [...(prev[specKey] || [])].filter((x) => x !== val);
              const next = { ...prev };
              if (cur.length) next[specKey] = cur;
              else delete next[specKey];
              return next;
            })
        });
      });
    });
    if (minRating !== null) {
      chips.push({
        key: 'rating',
        label: 'Рейтинг 4 и выше',
        onRemove: () => setMinRating(null)
      });
    }
    if (hasReview) {
      chips.push({
        key: 'review',
        label: 'Есть отзывы',
        onRemove: () => setHasReview(false)
      });
    }
    if (reliableModels) {
      chips.push({
        key: 'new-models',
        label: 'Новые модели',
        onRemove: () => setReliableModels(false)
      });
    }
    return chips;
  }, [
    filterInStock,
    priceRange,
    maxPrice,
    selectedBrands,
    filters,
    minRating,
    hasReview,
    reliableModels,
    getDisplayName
  ]);

  // Оптимизированная функция подсчета
  const getSpecificationCount = useCallback((key, value) => {
    return specificationsCountMap.get(`${key}-${value}`) || 0;
  }, [specificationsCountMap]);

  // Мемоизированный подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!filterInStock) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    count += selectedBrands.length;
    Object.values(filters).forEach((values) => {
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

  const filtersCardProps = {
    filterInStock,
    setFilterInStock,
    priceRange,
    setPriceRange,
    selectedBrands,
    setSelectedBrands,
    filters,
    setFilters,
    brands,
    specifications,
    getDisplayName,
    clearAllFilters: () => {
      clearAllFilters();
      setMobileFiltersOpen(false);
    },
    activeFiltersCount,
    getSpecificationCount,
    minRating,
    setMinRating,
    reliableModels,
    setReliableModels,
    hasReview,
    setHasReview,
    getBrandCount,
    filterChips,
    resultCount: filteredAndSortedProducts.length,
    priceCeiling: PRICE_FILTER_CEILING
  };

  return (
    <Container className="category-page">
      <Row>
        {isDesktop && (
          <Col lg={3} className="filters-column">
            <div className="sticky-filters">
              <FiltersCard {...filtersCardProps} />
            </div>
          </Col>
        )}

        {!isDesktop && (
          <Offcanvas
            show={mobileFiltersOpen}
            onHide={() => setMobileFiltersOpen(false)}
            placement="start"
            backdrop
            scroll={false}
            container={offcanvasContainer}
            style={{ zIndex: 2000002 }}
            className="category-filters-offcanvas"
          >
            <Offcanvas.Header closeButton className="border-bottom-0 pb-0">
              <Offcanvas.Title className="visually-hidden">Фильтры</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <FiltersCard {...filtersCardProps} />
            </Offcanvas.Body>
            <div className="mobile-offcanvas-footer">
              <Button
                variant="primary"
                className="w-100 mobile-offcanvas-apply-btn"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Показать {filteredAndSortedProducts.length} товаров
              </Button>
            </div>
          </Offcanvas>
        )}

        <Col lg={isDesktop ? 9 : 12} className="products-column">
          {!isDesktop && (
            <div className="mobile-filters-inline-wrap">
              <Button
                type="button"
                variant="primary"
                className="mobile-filters-inline-btn"
                onClick={() => setMobileFiltersOpen(true)}
              >
                Открыть фильтры
                {activeFiltersCount > 0 && (
                  <span className="mobile-filters-inline-badge">{activeFiltersCount}</span>
                )}
              </Button>
            </div>
          )}
          <SortingCard
            sortBy={sortBy}
            setSortBy={setSortBy}
            onOpenFilters={() => setMobileFiltersOpen(true)}
            showFilterButton={!isDesktop}
            resultCount={filteredAndSortedProducts.length}
            activeFiltersCount={activeFiltersCount}
          />

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
      {!isDesktop && (
        <div className="mobile-filters-fab-wrap">
          <Button
            type="button"
            className="mobile-filters-fab"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="mobile-filters-fab-badge">{activeFiltersCount}</span>
            )}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default CategoryPage;