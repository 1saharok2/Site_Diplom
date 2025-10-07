import React from 'react';
import { Card, Form, Badge, Button } from 'react-bootstrap';

const FiltersCard = ({ 
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
  clearAllFilters,
  activeFiltersCount,
  getSpecificationCount
}) => {
  
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

  const maxPrice = 500000; // Это значение должно передаваться из CategoryPage

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
        {/* Секция "Наличие в магазинах" как в макете */}
        <div className="filter-group">
          <h6>Наличие в магазинах</h6>
          <div className="filter-toggle-group">
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-all"
                label="В любом из 13 магазинов"
                className="mb-0"
                defaultChecked
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-instock"
                label="В наличии"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-today"
                label="Под заказ: сегодня"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-tomorrow"
                label="Под заказ: завтра"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-later"
                label="Под заказ: позже"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="radio"
                name="availability"
                id="availability-out"
                label="Отсутствующие в продаже"
                className="mb-0"
              />
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <hr className="filter-divider" />

        {/* Секция дополнительных фильтров как в макете */}
        <div className="filter-group">
          <div className="filter-toggle-group">
            <div className="filter-toggle-item">
              <Form.Check
                type="checkbox"
                id="rating-4"
                label="Рейтинг 4 и выше (1628)"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="checkbox"
                id="reliable-models"
                label="Надёжные модели (1239) минимум обращений в сервис"
                className="mb-0"
              />
            </div>
            <div className="filter-toggle-item">
              <Form.Check
                type="checkbox"
                id="has-review"
                label="Есть обзор (891)"
                className="mb-0"
              />
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <hr className="filter-divider" />

        {/* Секция цены как в макете */}
        <div className="filter-group">
          <h6>Цена</h6>
          <div className="price-inputs mb-3">
            <Form.Control
              type="number"
              placeholder="от 50"
              size="sm"
            />
            <Form.Control
              type="number"
              placeholder="до 564 999"
              size="sm"
            />
          </div>
          <div className="price-ranges">
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-less-4000"
                label="Менее 4 000 ₽"
                className="mb-0"
              />
            </div>
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-4001-10000"
                label="4 001 - 10 000 ₽ (184)"
                className="mb-0"
              />
            </div>
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-10001-18000"
                label="10 001 - 18 000 ₽ (349)"
                className="mb-0"
              />
            </div>
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-18001-27000"
                label="18 001 - 27 000 ₽ (231)"
                className="mb-0"
              />
            </div>
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-27001-40000"
                label="27 001 - 40 000 ₽ (218)"
                className="mb-0"
              />
            </div>
            <div className="price-range-item">
              <Form.Check
                type="radio"
                name="price-range"
                id="price-40001-more"
                label="40 001 ₽ и более (709)"
                className="mb-0"
              />
            </div>
          </div>
        </div>

        {/* Секция характеристик - упрощенная версия */}
        {specifications && Object.keys(specifications).length > 0 && (
          <div className="specifications-filter-group">
            <h6 className="specifications-title">
              Характеристики
              {filters && Object.values(filters).flat().length > 0 && (
                <Badge bg="primary" className="ms-2">
                  {Object.values(filters).flat().length}
                </Badge>
              )}
            </h6>
            <div className="specifications-list-simple">
              {Object.entries(specifications).slice(0, 10).map(([key, values]) => 
                values.slice(0, 5).map(value => (
                  <div key={`${key}-${value}`} className="specification-item-simple">
                    <Form.Check
                      type="checkbox"
                      id={`${key}-${value}`}
                      checked={filters && (filters[key] || []).includes(value)}
                      onChange={() => handleSpecificationToggle(key, value)}
                      className="spec-checkbox-simple mb-0"
                    />
                    <label 
                      htmlFor={`${key}-${value}`}
                      className="spec-label-simple"
                    >
                      <span>{getDisplayName(key)}: {value}</span>
                      <span className="spec-count">
                        {getSpecificationCount(key, value)}
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Оригинальные функциональные фильтры (скрыты) */}
        <div className="filter-group d-none">
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

        <div className="filter-group d-none">
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

        {brands && brands.length > 0 && (
          <div className="filter-group d-none">
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
      </Card.Body>
    </Card>
  );
};

export default FiltersCard;