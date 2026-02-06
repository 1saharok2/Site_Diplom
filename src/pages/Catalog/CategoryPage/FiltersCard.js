import React, { useState } from 'react';
import { Card, Form, Badge, Button } from 'react-bootstrap';

const FiltersCard = ({ 
  filterInStock = true, 
  setFilterInStock = () => {}, 
  priceRange = [0, 0], 
  setPriceRange = () => {}, 
  selectedBrands = [], 
  setSelectedBrands = () => {},
  filters = {},
  setFilters = () => {},
  brands = [],
  specifications = {},
  getDisplayName = (k) => k,
  clearAllFilters = () => {},
  activeFiltersCount = 0,
  getSpecificationCount = () => 0,
  maxPrice = 500000,
  minRating = null,
  setMinRating = () => {},
  reliableModels = false,
  setReliableModels = () => {},
  hasReview = false,
  setHasReview = () => {},
  getBrandCount = () => 0
}) => {
  // Состояния сворачивания секций
  const [openSections, setOpenSections] = useState({
    availability: false,
    price: false,
    brands: false,
    rating: false,
    techSpecs: false,
    screen: false,
    cameras: false,
    battery: false,
    other: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceRangeChange = (index, value) => {
    const parsed = value === '' ? '' : parseInt(value, 10);
    const newRange = Array.isArray(priceRange) ? [...priceRange] : [0, maxPrice];
    newRange[index] = Number.isNaN(parsed) ? 0 : parsed;
    setPriceRange(newRange);
  };

  const handleBrandToggle = (brand) => {
    if (!brand && brand !== 0) return;
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleSpecificationToggle = (specKey, value) => {
    setFilters(prev => {
      const currentValues = Array.isArray(prev[specKey]) ? prev[specKey] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const next = { ...prev, [specKey]: newValues };
      if (newValues.length === 0) {
        delete next[specKey];
      }
      return next;
    });
  };

  const handleRatingFilterChange = (e) => setMinRating(e.target?.checked ? 4 : null);
  const handleReliableModelsChange = (e) => setReliableModels(Boolean(e.target?.checked));
  const handleHasReviewChange = (e) => setHasReview(Boolean(e.target?.checked));

  const sanitizeId = (str) => String(str).replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
  
  const renderKeySection = (key) => {
    const values = Array.isArray(specifications[key]) ? specifications[key] : [];
    if (values.length === 0) return null;

    return (
      <div className="mb-3">
        <div className="fw-semibold mb-2 filter-subtitle">{getDisplayName(key)}</div>
        {values.map(value => {
          const count = getSpecificationCount(key, value);
          if (!count || count <= 0) return null;
          const fid = `${sanitizeId(key)}-${sanitizeId(value)}`;
          const checked = Array.isArray(filters[key]) && filters[key].includes(value);
          return (
            <div key={fid} className="dns-filter-item">
              <Form.Check
                type="checkbox"
                id={fid}
                checked={checked}
                onChange={() => handleSpecificationToggle(key, value)}
                className="dns-checkbox mb-0"
              />
              <label htmlFor={fid} className="dns-filter-label">
                <span className="dns-filter-text">{value}</span>
                <span className="dns-filter-count">{count}</span>
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  // Пресеты цен как в DNS
  const pricePresets = [
    [0, 10000],
    [10001, 30000],
    [30001, 70000],
    [70001, 150000],
    [150001, 500000]
  ];

  // ✅ ИСПРАВЛЕНО: Только рабочие группы фильтров
  const techSpecsKeys = ['nfc', 'supports_5g', 'waterproof', 'wireless_charge_support'];
  const screenKeys = ['screen_size_range', 'display', 'refresh_rate', 'resolution_class'];
  const cameraKeys = ['camera_count_bucket', 'video_recording'];
  const batteryKeys = ['battery_capacity_bucket'];
  const otherKeys = ['os', 'material_basic'];

  // ✅ ИСПРАВЛЕНО: Правильная проверка наличия данных
  const hasTechSpecs = techSpecsKeys.some(k => {
    const hasData = specifications[k] && Array.isArray(specifications[k]) && specifications[k].length > 0;
    if (hasData) {
      console.log(`✅ Группа ${k} имеет данные:`, specifications[k]);
    }
    return hasData;
  });
  
  const hasScreen = screenKeys.some(k => specifications[k]?.length > 0);
  const hasCameras = cameraKeys.some(k => specifications[k]?.length > 0);
  const hasBattery = batteryKeys.some(k => specifications[k]?.length > 0);
  const hasOther = otherKeys.some(k => specifications[k]?.length > 0);

  return (
    <Card className="dns-filters-card">
      <Card.Header className="dns-filters-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 dns-filters-title">
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge bg="primary" className="dns-active-badge">
                {activeFiltersCount}
              </Badge>
            )}
          </h5>
          <Button 
            variant="link" 
            size="sm" 
            onClick={clearAllFilters}
            className="dns-clear-btn"
            disabled={activeFiltersCount === 0}
          >
            Сбросить всё
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="dns-filters-body">
        {/* Встроенные стили */}
        <style>{`
          .dns-filters-card {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            box-shadow: none;
            margin-bottom: 20px;
          }
          
          .dns-filters-header {
            background: #fff;
            border-bottom: 1px solid #e5e5e5;
            padding: 16px 20px;
          }
          
          .dns-filters-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .dns-active-badge {
            background: #0066ff !important;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
          }
          
          .dns-clear-btn {
            color: #0066ff;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            padding: 4px 8px;
          }
          
          .dns-clear-btn:hover {
            color: #0052cc;
            text-decoration: underline;
          }
          
          .dns-clear-btn:disabled {
            color: #999;
            cursor: not-allowed;
            text-decoration: none;
          }
          
          .dns-filters-body {
            padding: 0;
          }
          
          .dns-filter-section {
            border-bottom: 1px solid #e5e5e5;
            padding: 16px 20px;
          }
          
          .dns-filter-section:last-child {
            border-bottom: none;
          }
          
          .dns-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            margin-bottom: 0;
            user-select: none;
          }
          
          .dns-section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin: 0;
          }
          
          .dns-section-icon {
            color: #666;
            transition: transform 0.2s;
            font-size: 12px;
          }
          
          .dns-section-open .dns-section-icon {
            transform: rotate(180deg);
          }
          
          .dns-section-content {
            margin-top: 12px;
            display: block;
          }
          
          /* Переключатель наличия */
          .dns-availability-switch {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 8px 0;
          }
          
          .dns-switch {
            position: relative;
            width: 44px;
            height: 24px;
          }
          
          .dns-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .dns-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            border-radius: 24px;
            transition: .4s;
          }
          
          .dns-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            border-radius: 50%;
            transition: .4s;
          }
          
          input:checked + .dns-slider {
            background-color: #0066ff;
          }
          
          input:checked + .dns-slider:before {
            transform: translateX(20px);
          }
          
          .dns-switch-label {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
          
          /* Цена */
          .dns-price-inputs {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .dns-price-input-group {
            flex: 1;
          }
          
          .dns-price-label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .dns-price-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .dns-price-input:focus {
            border-color: #0066ff;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0,102,255,0.1);
          }
          
          .dns-price-presets {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .dns-price-preset-btn {
            padding: 6px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: white;
            color: #333;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .dns-price-preset-btn:hover {
            border-color: #0066ff;
            color: #0066ff;
          }
          
          /* Бренды и характеристики */
          .dns-filter-list {
            max-height: 300px;
            overflow-y: auto;
            padding-right: 4px;
          }
          
          .dns-filter-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
          }
          
          .dns-checkbox {
            margin-right: 10px;
          }
          
          .dns-checkbox .form-check-input {
            width: 18px;
            height: 18px;
            border: 2px solid #ccc;
            border-radius: 4px;
          }
          
          .dns-checkbox .form-check-input:checked {
            background-color: #0066ff;
            border-color: #0066ff;
          }
          
          .dns-filter-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
            cursor: pointer;
            font-size: 14px;
          }
          
          .dns-filter-text {
            color: #333;
          }
          
          .dns-filter-count {
            color: #666;
            font-size: 12px;
            background: #f5f5f5;
            padding: 2px 8px;
            border-radius: 10px;
          }
          
          /* Доп фильтры */
          .dns-extra-filter {
            padding: 8px 0;
          }
          
          .dns-extra-filter .form-check-input {
            width: 18px;
            height: 18px;
          }
          
          .dns-extra-filter .form-check-label {
            font-size: 14px;
            color: #333;
            margin-left: 8px;
          }
          
          /* Стили для прокрутки */
          .dns-filter-list::-webkit-scrollbar {
            width: 4px;
          }
          
          .dns-filter-list::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          .dns-filter-list::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 2px;
          }
          
          .dns-filter-list::-webkit-scrollbar-thumb:hover {
            background: #999;
          }
        `}</style>

        {/* 1. Наличие */}
        <div className="dns-filter-section">
          <div 
            className={`dns-section-header ${openSections.availability ? 'dns-section-open' : ''}`}
            onClick={() => toggleSection('availability')}
          >
            <h6 className="dns-section-title">Наличие</h6>
            <span className="dns-section-icon">▼</span>
          </div>
          {openSections.availability && (
            <div className="dns-section-content">
              <div className="dns-availability-switch">
                <div className="dns-switch">
                  <input
                    type="checkbox"
                    id="stock-filter"
                    checked={filterInStock}
                    onChange={(e) => setFilterInStock(e.target.checked)}
                  />
                  <span className="dns-slider"></span>
                </div>
                <label htmlFor="stock-filter" className="dns-switch-label">
                  Только в наличии
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 2. Цена */}
        <div className="dns-filter-section">
          <div 
            className={`dns-section-header ${openSections.price ? 'dns-section-open' : ''}`}
            onClick={() => toggleSection('price')}
          >
            <h6 className="dns-section-title">Цена, ₽</h6>
            <span className="dns-section-icon">▼</span>
          </div>
          {openSections.price && (
            <div className="dns-section-content">
              <div className="dns-price-inputs">
                <div className="dns-price-input-group">
                  <label className="dns-price-label">от</label>
                  <input
                    type="number"
                    className="dns-price-input"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    min="0"
                    max={maxPrice}
                    placeholder="0"
                  />
                </div>
                <div className="dns-price-input-group">
                  <label className="dns-price-label">до</label>
                  <input
                    type="number"
                    className="dns-price-input"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    min="0"
                    max={maxPrice}
                    placeholder={maxPrice.toLocaleString('ru-RU')}
                  />
                </div>
              </div>
              <div className="dns-price-presets">
                {pricePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="dns-price-preset-btn"
                    onClick={() => setPriceRange(preset)}
                  >
                    {preset[0].toLocaleString('ru-RU')} - {preset[1].toLocaleString('ru-RU')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Бренды */}
        {brands.length > 0 && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.brands ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('brands')}
            >
              <h6 className="dns-section-title">Бренды</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.brands && (
              <div className="dns-section-content">
                <div className="dns-filter-list">
                  {brands.map((brand) => {
                    const brandCount = getBrandCount(brand);
                    const id = `brand-${sanitizeId(brand)}`;
                    return (
                      <div key={brand} className="dns-filter-item">
                        <Form.Check
                          type="checkbox"
                          id={id}
                          className="dns-checkbox mb-0"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                        <label htmlFor={id} className="dns-filter-label">
                          <span className="dns-filter-text">{brand}</span>
                          <span className="dns-filter-count">{brandCount}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Рейтинг и отзывы */}
        <div className="dns-filter-section">
          <div 
            className={`dns-section-header ${openSections.rating ? 'dns-section-open' : ''}`}
            onClick={() => toggleSection('rating')}
          >
            <h6 className="dns-section-title">Рейтинг и отзывы</h6>
            <span className="dns-section-icon">▼</span>
          </div>
          {openSections.rating && (
            <div className="dns-section-content">
              <div className="dns-extra-filter">
                <Form.Check
                  type="checkbox"
                  id="rating-4"
                  label="Рейтинг 4 и выше"
                  checked={minRating === 4}
                  onChange={handleRatingFilterChange}
                />
              </div>
              <div className="dns-extra-filter">
                <Form.Check
                  type="checkbox"
                  id="has-review"
                  label="Есть отзывы"
                  checked={hasReview}
                  onChange={handleHasReviewChange}
                />
              </div>
              <div className="dns-extra-filter">
                <Form.Check
                  type="checkbox"
                  id="reliable-models"
                  label="Новые модели"
                  checked={reliableModels}
                  onChange={handleReliableModelsChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Технические характеристики */}
        {hasTechSpecs && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.techSpecs ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('techSpecs')}
            >
              <h6 className="dns-section-title">Технические характеристики</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.techSpecs && (
              <div className="dns-section-content">
                {techSpecsKeys.map(key => {
                  console.log(`🔑 Рендер тех характеристики ${key}:`, specifications[key]);
                  return renderKeySection(key);
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. Экран */}
        {hasScreen && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.screen ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('screen')}
            >
              <h6 className="dns-section-title">Экран</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.screen && (
              <div className="dns-section-content">
                {screenKeys.map(key => renderKeySection(key))}
              </div>
            )}
          </div>
        )}

        {/* 7. Камеры */}
        {hasCameras && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.cameras ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('cameras')}
            >
              <h6 className="dns-section-title">Камеры</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.cameras && (
              <div className="dns-section-content">
                {cameraKeys.map(key => renderKeySection(key))}
              </div>
            )}
          </div>
        )}

        {/* 8. Аккумулятор */}
        {hasBattery && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.battery ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('battery')}
            >
              <h6 className="dns-section-title">Аккумулятор</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.battery && (
              <div className="dns-section-content">
                {batteryKeys.map(key => renderKeySection(key))}
              </div>
            )}
          </div>
        )}

        {/* 9. Дополнительно */}
        {hasOther && (
          <div className="dns-filter-section">
            <div 
              className={`dns-section-header ${openSections.other ? 'dns-section-open' : ''}`}
              onClick={() => toggleSection('other')}
            >
              <h6 className="dns-section-title">Дополнительно</h6>
              <span className="dns-section-icon">▼</span>
            </div>
            {openSections.other && (
              <div className="dns-section-content">
                {otherKeys.map(key => renderKeySection(key))}
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FiltersCard;