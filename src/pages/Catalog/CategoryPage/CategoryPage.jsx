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

  // Мемоизированные функции обработки
  const toYesNo = useCallback((v) => {
    if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
    if (v === 'true' || v === 'True') return 'Да';
    if (v === 'false' || v === 'False') return 'Нет';
    return v;
  }, []);

  const getResolutionClass = useCallback((res) => {
    if (!res) return null;
    const m = String(res).match(/(\d+)x(\d+)/);
    if (!m) return null;
    const w = parseInt(m[1], 10);
    const h = parseInt(m[2], 10);
    const maxSide = Math.max(w, h);
    if (maxSide >= 3000) return 'Quad HD+';
    if (maxSide >= 2300) return 'Full HD+';
    return 'HD+';
  }, []);

  const getScreenSizeRange = useCallback((sizeStr) => {
    if (!sizeStr) return null;
    const num = parseFloat(String(sizeStr).replace(/[^0-9.]/g, ''));
    if (!num) return null;
    if (num < 6.0) return 'до 6.0"';
    if (num <= 6.5) return '6.1-6.5"';
    if (num <= 6.9) return '6.6-6.9"';
    return '7.0+"';
  }, []);

  const getBatteryCapacityBucket = useCallback((capStr) => {
    if (!capStr) return null;
    const num = parseInt(String(capStr).replace(/[^0-9]/g, ''), 10);
    if (!num) return null;
    if (num < 2000) return '<2000 мАч';
    if (num < 3000) return '2000–3000 мАч';
    if (num < 4000) return '3000–4000 мАч';
    if (num < 5000) return '4000–5000 мАч';
    if (num < 6000) return '5000–6000 мАч';
    return '6000+ мАч';
  }, []);

  const getFastChargeRange = useCallback((wattStr) => {
    if (!wattStr) return null;
    const num = parseInt(String(wattStr).replace(/[^0-9]/g, ''), 10);
    if (!num) return 'Нет';
    if (num < 30) return '15-30 Вт';
    if (num <= 65) return '30-65 Вт';
    return '65+ Вт';
  }, []);

  const getCameraCountBucket = useCallback((cameraStr) => {
    if (!cameraStr) return null;
    const plusCount = (String(cameraStr).match(/\+/g) || []).length + 1;
    if (plusCount <= 2) return '2';
    if (plusCount === 3) return '3';
    if (plusCount === 4) return '4';
    return '5+';
  }, []);

  const getProcessorCompany = useCallback((proc) => {
    const s = String(proc || '').toLowerCase();
    if (s.includes('qualcomm') || s.includes('snapdragon')) return 'Qualcomm';
    if (s.includes('mediatek')) return 'MediaTek';
    if (s.includes('exynos')) return 'Samsung';
    if (s.includes('apple') || s.includes('a18') || s.includes('a17') || s.includes('a-series')) return 'Apple';
    if (s.includes('google') || s.includes('tensor')) return 'Google';
    return null;
  }, []);

  const getCpuCores = useCallback((processor, chip) => {
    const texts = [String(processor || ''), String(chip || '')];
    for (const t of texts) {
      // English patterns: 12-core, 8 core CPU
      const mEn = t.match(/(\d+)\s*-?\s*core/i);
      if (mEn && mEn[1]) return `${parseInt(mEn[1], 10)} ядер`;
      // Russian patterns: 6-ядерн, 8 ядерный, 8-ядерный CPU
      const mRu = t.match(/(\d+)\s*-?\s*ядер/i);
      if (mRu && mRu[1]) return `${parseInt(mRu[1], 10)} ядер`;
      const mRu2 = t.match(/(\d+)\s*-?\s*ядерн/i);
      if (mRu2 && mRu2[1]) return `${parseInt(mRu2[1], 10)} ядер`;
      // Sometimes like "6-ядерным CPU"
      const mCpu = t.match(/(\d+)\s*-?\s*ядерн.*CPU/i);
      if (mCpu && mCpu[1]) return `${parseInt(mCpu[1], 10)} ядер`;
    }
    return null;
  }, []);

  // Мемоизированное получение спецификаций
  const specifications = useMemo(() => {
    const specs = {};

    const addValue = (key, value) => {
      if (value === null || value === undefined || value === '') return;
      if (!specs[key]) specs[key] = new Set();
      specs[key].add(String(value));
    };

    processedProducts.forEach(product => {
      const { parsedSpecs } = product;

      // Сырые значения в справочник
      Object.entries(parsedSpecs).forEach(([key, value]) => {
        addValue(key, toYesNo(value));
      });

      // Вычисляемые признаки
      const network = parsedSpecs.network || '';
      const supports5g = /(^|\b)5G(\b|,)/i.test(String(network));
      addValue('supports_5g', supports5g ? 'Да' : 'Нет');

      const wireless = parsedSpecs.wireless_charge;
      const hasWireless = (typeof wireless === 'boolean') ? wireless : (wireless && String(wireless).toLowerCase() !== 'false');
      addValue('wireless_charge_support', hasWireless ? 'Да' : 'Нет');

      // Диапазоны
      addValue('screen_size_range', getScreenSizeRange(parsedSpecs.screen_size));
      addValue('battery_capacity_bucket', getBatteryCapacityBucket(parsedSpecs.battery));
      addValue('fast_charge_range', getFastChargeRange(parsedSpecs.fast_charge));

      // Камеры
      addValue('camera_count_bucket', getCameraCountBucket(parsedSpecs.camera));

      // Видео
      const video = String(parsedSpecs.video || '');
      if (/8k/i.test(video)) addValue('video_recording', '8K');
      if (/4k/i.test(video)) addValue('video_recording', '4K');

      // Разрешение класс
      addValue('resolution_class', getResolutionClass(parsedSpecs.resolution));

      // Производитель процессора (компания)
      addValue('processor_company', getProcessorCompany(parsedSpecs.processor));

      // Количество ядер
      addValue('cpu_cores', getCpuCores(parsedSpecs.processor, parsedSpecs.chip));

      // Нормализация материала корпуса: стекло/металл/пластик
      const materialRaw = String(parsedSpecs.material || '').toLowerCase();
      let materialBasic = null;
      if (/стекл|glass/.test(materialRaw)) materialBasic = 'Стекло';
      if (/алюм|металл|metal|steel/.test(materialRaw)) materialBasic = 'Металл';
      if (/пласт|plastic/.test(materialRaw)) materialBasic = 'Пластик';
      addValue('material_basic', materialBasic);
    });

    const result = {};
    Object.keys(specs).forEach(key => {
      result[key] = Array.from(specs[key]).filter(Boolean).sort();
    });

    return result;
  }, [processedProducts, toYesNo, getResolutionClass, getScreenSizeRange, getBatteryCapacityBucket, getFastChargeRange, getCameraCountBucket, getProcessorCompany, getCpuCores]);
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

    // Фильтр по характеристикам - используем предобработанные данные
    if (Object.keys(filters).length > 0) {
      const { parsedSpecs } = product;
      
      for (const [key, values] of Object.entries(filters)) {
        if (values.length > 0) {
          const productValue = parsedSpecs[key];
          if (!productValue || !values.includes(productValue.toString())) {
            return false;
          }
        }
      }
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

  // Мемоизированная карта подсчета спецификаций
  const specificationsCountMap = useMemo(() => {
    const countMap = new Map();
    
    processedProducts.forEach(product => {
      const { parsedSpecs } = product;
      
      // Функция для добавления в карту
      const addToMap = (key, value) => {
        if (!value) return;
        const mapKey = `${key}-${value}`;
        countMap.set(mapKey, (countMap.get(mapKey) || 0) + 1);
      };

      // Сырые значения
      Object.entries(parsedSpecs).forEach(([key, val]) => {
        addToMap(key, toYesNo(val));
      });

      // Вычисляемые значения
      const network = parsedSpecs.network || '';
      const supports5g = /(^|\b)5G(\b|,)/i.test(String(network));
      addToMap('supports_5g', supports5g ? 'Да' : 'Нет');

      const wireless = parsedSpecs.wireless_charge;
      const hasWireless = (typeof wireless === 'boolean') ? wireless : (wireless && String(wireless).toLowerCase() !== 'false');
      addToMap('wireless_charge_support', hasWireless ? 'Да' : 'Нет');

      addToMap('screen_size_range', getScreenSizeRange(parsedSpecs.screen_size));
      addToMap('battery_capacity_bucket', getBatteryCapacityBucket(parsedSpecs.battery));
      addToMap('fast_charge_range', getFastChargeRange(parsedSpecs.fast_charge));
      addToMap('camera_count_bucket', getCameraCountBucket(parsedSpecs.camera));

      const video = String(parsedSpecs.video || '');
      if (/8k/i.test(video)) addToMap('video_recording', '8K');
      if (/4k/i.test(video)) addToMap('video_recording', '4K');

      addToMap('resolution_class', getResolutionClass(parsedSpecs.resolution));
      addToMap('processor_company', getProcessorCompany(parsedSpecs.processor));
      addToMap('cpu_cores', getCpuCores(parsedSpecs.processor, parsedSpecs.chip));

      const materialRaw = String(parsedSpecs.material || '').toLowerCase();
      let materialBasic = null;
      if (/стекл|glass/.test(materialRaw)) materialBasic = 'Стекло';
      if (/алюм|металл|metal|steel/.test(materialRaw)) materialBasic = 'Металл';
      if (/пласт|plastic/.test(materialRaw)) materialBasic = 'Пластик';
      addToMap('material_basic', materialBasic);
    });

    return countMap;
  }, [processedProducts, toYesNo, getScreenSizeRange, getBatteryCapacityBucket, getFastChargeRange, getCameraCountBucket, getResolutionClass, getProcessorCompany, getCpuCores]);

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