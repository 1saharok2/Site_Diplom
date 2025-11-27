import React, { useState, useEffect } from 'react';
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
  showFilters = false,
  setShowFilters = () => {},
  minRating = null,
  setMinRating = () => {},
  reliableModels = false,
  setReliableModels = () => {},
  hasReview = false,
  setHasReview = () => {},
  getBrandCount = () => 0
}) => {
  // Определяем мобильное устройство
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Состояния сворачивания секций фильтров - на мобильных изначально свернуты
  const [isExtraOpen, setIsExtraOpen] = useState(!isMobile);
  const [isStockOpen, setIsStockOpen] = useState(!isMobile);
  const [isPriceOpen, setIsPriceOpen] = useState(!isMobile);
  const [isBrandsOpen, setIsBrandsOpen] = useState(!isMobile);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(!isMobile);
  const [isMemoryOpen, setIsMemoryOpen] = useState(!isMobile);
  const [isScreenOpen, setIsScreenOpen] = useState(!isMobile);
  const [isCamerasOpen, setIsCamerasOpen] = useState(!isMobile);
  const [isCpuOpen, setIsCpuOpen] = useState(!isMobile);
  const [isBatteryOpen, setIsBatteryOpen] = useState(!isMobile);
  const [isExtraSpecsOpen, setIsExtraSpecsOpen] = useState(!isMobile);

  // Функция для разворачивания/сворачивания всех секций
  const toggleAllSections = (open) => {
    setIsExtraOpen(open);
    setIsStockOpen(open);
    setIsPriceOpen(open);
    setIsBrandsOpen(open);
    setIsTechSpecsOpen(open);
    setIsMemoryOpen(open);
    setIsScreenOpen(open);
    setIsCamerasOpen(open);
    setIsCpuOpen(open);
    setIsBatteryOpen(open);
    setIsExtraSpecsOpen(open);
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
      <div className="mb-2">
        <div className="fw-semibold mb-1 filter-subtitle">{getDisplayName(key)}</div>
        {values.map(value => {
          const count = getSpecificationCount(key, value);
          if (!count || count <= 0) return null;
          const fid = `${sanitizeId(key)}-${sanitizeId(value)}`;
          const checked = Array.isArray(filters[key]) && filters[key].includes(value);
          return (
            <div key={fid} className="specification-item-simple">
              <Form.Check
                type="checkbox"
                id={fid}
                checked={checked}
                onChange={() => handleSpecificationToggle(key, value)}
                className="spec-checkbox-simple mb-0"
              />
              <label htmlFor={fid} className="spec-label-simple">
                <span className="spec-text">{value}</span>
                <span className="spec-count">{count}</span>
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  // Пресеты цен
  const pricePresets = [
    [0, 10000],
    [10001, 30000],
    [30001, 70000],
    [70001, 150000],
    [150001, 500000]
  ];

  return (
    <Card className="filters-card">
      <Card.Header className="filters-card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 filters-title">
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge bg="primary" className="active-filters-badge">
                {activeFiltersCount}
              </Badge>
            )}
          </h5>
          <div className="d-flex align-items-center gap-2">
            {isMobile && (
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => toggleAllSections(true)}
                className="expand-all-btn"
              >
                Развернуть
              </Button>
            )}
            <Button 
              variant="link" 
              size="sm" 
              onClick={clearAllFilters}
              className="clear-filters-btn"
              disabled={activeFiltersCount === 0}
            >
              Сбросить
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="filters-card-body">
        {/* Modern CSS styles */}
        <style>{`
          .filter-caret {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 8px;
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            transform: rotate(-45deg);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            vertical-align: middle;
            transform-origin: center;
          }
          .filter-caret[data-open="true"] {
            transform: rotate(45deg);
          }
          .collapsible {
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Mobile optimizations */
          @media (max-width: 991.98px) {
            .filters-card {
              border-radius: 12px;
              margin-bottom: 16px;
            }
            .filters-card-header {
              padding: 16px;
            }
            .filters-card-body {
              padding: 0 16px 16px;
              max-height: 60vh;
              overflow-y: auto;
            }
            .filter-group {
              margin-bottom: 20px;
              padding-bottom: 16px;
            }
            .filter-toggle-item,
            .specification-item-simple,
            .brand-item {
              min-height: 48px;
              padding: 12px 0;
            }
          }
        `}</style>
        
        <div className="filters-content">
          {/* Доп. фильтры */}
          <div className="filter-group">
            <div className="filter-header" role="button" onClick={() => setIsExtraOpen(v => !v)}>
              <span className="filter-caret" data-open={isExtraOpen}></span>
              <h6 className="filter-title">Доп. фильтры</h6>
            </div>
            <div className="collapsible" style={{maxHeight: isExtraOpen ? 1000 : 0}}>
              <div className="filter-toggle-group">
                <div className="filter-toggle-item">
                  <Form.Check
                    type="checkbox"
                    id="rating-4"
                    label="Рейтинг 4 и выше"
                    checked={minRating === 4}
                    onChange={handleRatingFilterChange}
                  />
                </div>
                <div className="filter-toggle-item">
                  <Form.Check
                    type="checkbox"
                    id="has-review"
                    label="Есть отзывы"
                    checked={hasReview}
                    onChange={handleHasReviewChange}
                  />
                </div>
                <div className="filter-toggle-item">
                  <Form.Check
                    type="checkbox"
                    id="reliable-models"
                    label="Новые модели"
                    checked={reliableModels}
                    onChange={handleReliableModelsChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="filter-divider" />

          {/* Только в наличии */}
          <div className="filter-group">
            <div className="filter-header" role="button" onClick={() => setIsStockOpen(v => !v)}>
              <span className="filter-caret" data-open={isStockOpen}></span>
              <h6 className="filter-title">Наличие</h6>
            </div>
            <div className="collapsible" style={{maxHeight: isStockOpen ? 200 : 0}}>
              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="stock-filter"
                    checked={Boolean(filterInStock)}
                    onChange={(e) => setFilterInStock(Boolean(e.target.checked))}
                  />
                  <span className="slider"></span>
                </label>
                <span className="switch-label">Только в наличии</span>
              </div>
            </div>
          </div>

          {/* Цена */}
          <div className="filter-group">
            <div className="filter-header" role="button" onClick={() => setIsPriceOpen(v => !v)}>
              <span className="filter-caret" data-open={isPriceOpen}></span>
              <h6 className="filter-title">Цена, ₽</h6>
              <span className="price-range-value">
                {Number(priceRange[0]).toLocaleString('ru-RU')} - {Number(priceRange[1]).toLocaleString('ru-RU')}
              </span>
            </div>
            <div className="collapsible" style={{maxHeight: isPriceOpen ? 500 : 0}}>
              <div className="price-inputs-container">
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label htmlFor="price-min" className="price-label">От</label>
                    <Form.Control
                      type="number"
                      id="price-min"
                      placeholder="0"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                      min="0"
                      max={maxPrice}
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label htmlFor="price-max" className="price-label">До</label>
                    <Form.Control
                      type="number"
                      id="price-max"
                      placeholder={maxPrice.toLocaleString('ru-RU')}
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                      min="0"
                      max={maxPrice}
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="price-presets">
                  {pricePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="price-preset-btn"
                      onClick={() => setPriceRange(preset)}
                    >
                      {preset[0].toLocaleString('ru-RU')} - {preset[1].toLocaleString('ru-RU')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Бренды */}
          {brands && brands.length > 0 && (
            <div className="filter-group">
              <div className="filter-header" role="button" onClick={() => setIsBrandsOpen(v => !v)}>
                <span className="filter-caret" data-open={isBrandsOpen}></span>
                <h6 className="filter-title">Бренды</h6>
              </div>
              <div className="collapsible" style={{maxHeight: isBrandsOpen ? 800 : 0}}>
                <div className="brands-list">
                  {brands.map((brand) => {
                    const brandCount = getBrandCount ? getBrandCount(brand) : 0;
                    const id = `brand-${sanitizeId(brand)}`;
                    return (
                      <div key={brand} className="brand-item">
                        <Form.Check
                          type="checkbox"
                          id={id}
                          label={
                            <div className="brand-label">
                              <span className="brand-name">{brand}</span>
                              <span className="brand-count">{brandCount}</span>
                            </div>
                          }
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Отдельные группы характеристик */}
          {specifications && Object.keys(specifications).length > 0 && (
            <>
              {/* Технические характеристики */}
              {(() => {
                const keys = ['nfc','supports_5g','waterproof','wireless_charge_support'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsTechSpecsOpen(v => !v)}>
                      <span className="filter-caret" data-open={isTechSpecsOpen}></span>
                      <h6 className="filter-title">Технические характеристики</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isTechSpecsOpen ? 1000 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Память */}
              {(() => {
                const keys = ['ram','storage'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsMemoryOpen(v => !v)}>
                      <span className="filter-caret" data-open={isMemoryOpen}></span>
                      <h6 className="filter-title">Память</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isMemoryOpen ? 800 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Экран */}
              {(() => {
                const keys = ['screen_size_range','display','refresh_rate','resolution_class'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsScreenOpen(v => !v)}>
                      <span className="filter-caret" data-open={isScreenOpen}></span>
                      <h6 className="filter-title">Экран</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isScreenOpen ? 1000 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Камеры */}
              {(() => {
                const keys = ['camera_count_bucket','video_recording'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsCamerasOpen(v => !v)}>
                      <span className="filter-caret" data-open={isCamerasOpen}></span>
                      <h6 className="filter-title">Камеры</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isCamerasOpen ? 800 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Процессор */}
              {(() => {
                const keys = ['cpu_cores','processor_manufacturer'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsCpuOpen(v => !v)}>
                      <span className="filter-caret" data-open={isCpuOpen}></span>
                      <h6 className="filter-title">Процессор</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isCpuOpen ? 600 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Аккумулятор */}
              {(() => {
                const keys = ['battery_capacity_bucket'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsBatteryOpen(v => !v)}>
                      <span className="filter-caret" data-open={isBatteryOpen}></span>
                      <h6 className="filter-title">Аккумулятор</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isBatteryOpen ? 800 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Дополнительно */}
              {(() => {
                const keys = ['release_year','os','material_basic'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="filter-header" role="button" onClick={() => setIsExtraSpecsOpen(v => !v)}>
                      <span className="filter-caret" data-open={isExtraSpecsOpen}></span>
                      <h6 className="filter-title">Дополнительно</h6>
                    </div>
                    <div className="collapsible" style={{maxHeight: isExtraSpecsOpen ? 800 : 0}}>
                      <div className="specifications-list-simple">
                        {keys.map(k => renderKeySection(k))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FiltersCard;