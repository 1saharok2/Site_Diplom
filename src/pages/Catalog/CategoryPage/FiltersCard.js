import React from 'react';
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
          {/* Доп. фильтры */}
          <div className="filter-group">
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

          <hr className="filter-divider" />

          {/* Только в наличии */}
          <div className="filter-group">
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

          {/* Цена */}
          <div className="filter-group">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6>Цена, ₽</h6>
              <span className="price-range-value">
                {Number(priceRange[0]).toLocaleString('ru-RU')} - {Number(priceRange[1]).toLocaleString('ru-RU')}
              </span>
            </div>

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

            <div className="price-presets d-flex flex-wrap gap-2">
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

          {/* Бренды */}
          {brands && brands.length > 0 && (
            <div className="filter-group">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Бренды</h6>
              </div>
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
          )}

          {/* Характеристики */}
          {specifications && Object.keys(specifications).length > 0 && (
            <div className="filter-group">
              <h6 className="specifications-title">
                Характеристики
                {filters && Object.values(filters).flat().length > 0 && (
                  <Badge bg="primary" className="ms-2">
                    {Object.values(filters).flat().length}
                  </Badge>
                )}
              </h6>
              <div className="specifications-list-simple">
                {Object.entries(specifications).slice(0, 8).map(([key, values]) => 
                  (Array.isArray(values) ? values.slice(0, 4) : []).map(value => {
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
                        <label 
                          htmlFor={fid}
                          className="spec-label-simple"
                        >
                          <span>{getDisplayName(key)}: {value}</span>
                          <span className="spec-count">
                            {getSpecificationCount(key, value)}
                          </span>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FiltersCard;
