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

  // Состояния сворачивания секций фильтров
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isScreenOpen, setIsScreenOpen] = useState(false);
  const [isCamerasOpen, setIsCamerasOpen] = useState(false);
  const [isCpuOpen, setIsCpuOpen] = useState(false);
  const [isBatteryOpen, setIsBatteryOpen] = useState(false);
  const [isExtraSpecsOpen, setIsExtraSpecsOpen] = useState(false);

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
        <div className="fw-semibold mb-1">{getDisplayName(key)}</div>
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
                <span>{value}</span>
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
        {/* local styles for caret and collapse animation */}
        <style>{`
          .filter-caret{display:inline-block;width:6px;height:6px;margin-right:6px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);transition:transform .2s ease;vertical-align:middle;align-self:center;transform-origin:center}
          .filter-caret[data-open="true"]{transform:rotate(45deg)}
          .collapsible{overflow:hidden;transition:max-height .25s ease}
        `}</style>
        <div>
          {/* Доп. фильтры */}
          <div className="filter-group">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsExtraOpen(v => !v)}>
                <span className="filter-caret" data-open={isExtraOpen}></span>
                <h6 className="mb-0">Доп. фильтры</h6>
              </div>
            </div>
            <div className="collapsible" style={{maxHeight: isExtraOpen ? 1000 : 0}}>
              <div className="filter-toggle-group pb-2">
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsStockOpen(v => !v)}>
                <span className="filter-caret" data-open={isStockOpen}></span>
                <h6 className="mb-0">Наличие</h6>
              </div>
            </div>
            <div className="collapsible" style={{maxHeight: isStockOpen ? 200 : 0}}>
              <div className="switch-container pb-2">
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsPriceOpen(v => !v)}>
                <span className="filter-caret" data-open={isPriceOpen}></span>
                <h6 className="mb-0">Цена, ₽</h6>
              </div>
              <span className="price-range-value">
                {Number(priceRange[0]).toLocaleString('ru-RU')} - {Number(priceRange[1]).toLocaleString('ru-RU')}
              </span>
            </div>
            <div className="collapsible" style={{maxHeight: isPriceOpen ? 500 : 0}}>
              <div className="price-inputs d-flex gap-2 mb-2">
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

              <div className="price-presets d-flex flex-wrap gap-2 pb-2">
                {pricePresets.map((preset, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline-primary"
                    onClick={() => setPriceRange(preset)}
                  >
                    {preset[0].toLocaleString('ru-RU')} - {preset[1].toLocaleString('ru-RU')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Бренды */}
          {brands && brands.length > 0 && (
            <div className="filter-group">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsBrandsOpen(v => !v)}>
                <span className="filter-caret" data-open={isBrandsOpen}></span>
                <h6 className="mb-0">Бренды</h6>
              </div>
            </div>
              <div className="collapsible" style={{maxHeight: isBrandsOpen ? 800 : 0}}>
                <div className="brands-list pb-2">
                  {brands.map((brand) => {
                    const brandCount = getBrandCount ? getBrandCount(brand) : 0;
                    const id = `brand-${sanitizeId(brand)}`;
                    return (
                      <div key={brand} className="brand-item">
                        <Form.Check
                          type="checkbox"
                          id={id}
                          label={
                            <div className="d-flex justify-content-between w-100">
                              <span>{brand}</span>
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

          {/* Отдельные группы характеристик без общего раздела */}
          {specifications && Object.keys(specifications).length > 0 && (
            <>
              {/* Технические характеристики */}
              {(() => {
                const keys = ['nfc','supports_5g','waterproof','wireless_charge_support'];
                const available = keys.some(k => Array.isArray(specifications[k]) && specifications[k].length > 0);
                if (!available) return null;
                return (
                  <div className="filter-group">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsTechSpecsOpen(v => !v)}>
                        <span className="filter-caret" data-open={isTechSpecsOpen}></span>
                        <h6 className="mb-0">Технические характеристики</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isTechSpecsOpen ? 1000 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsMemoryOpen(v => !v)}>
                        <span className="filter-caret" data-open={isMemoryOpen}></span>
                        <h6 className="mb-0">Память</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isMemoryOpen ? 800 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsScreenOpen(v => !v)}>
                        <span className="filter-caret" data-open={isScreenOpen}></span>
                        <h6 className="mb-0">Экран</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isScreenOpen ? 1000 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsCamerasOpen(v => !v)}>
                        <span className="filter-caret" data-open={isCamerasOpen}></span>
                        <h6 className="mb-0">Камеры</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isCamerasOpen ? 800 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsCpuOpen(v => !v)}>
                        <span className="filter-caret" data-open={isCpuOpen}></span>
                        <h6 className="mb-0">Процессор</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isCpuOpen ? 600 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsBatteryOpen(v => !v)}>
                        <span className="filter-caret" data-open={isBatteryOpen}></span>
                        <h6 className="mb-0">Аккумулятор</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isBatteryOpen ? 800 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2 cursor-pointer user-select-none" role="button" onClick={() => setIsExtraSpecsOpen(v => !v)}>
                        <span className="filter-caret" data-open={isExtraSpecsOpen}></span>
                        <h6 className="mb-0">Дополнительно</h6>
                      </div>
                    </div>
                    <div className="collapsible" style={{maxHeight: isExtraSpecsOpen ? 800 : 0}}>
                      <div className="specifications-list-simple pb-2">
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
