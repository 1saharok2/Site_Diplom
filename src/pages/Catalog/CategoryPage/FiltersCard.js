import React, { useState, useMemo, useCallback } from 'react';
import { Card, Form, Badge, Button } from 'react-bootstrap';
import { PRICE_FILTER_CEILING } from '../../../services/filterService';

const BRAND_PAGE_SIZE = 10;
const SPEC_PAGE_SIZE = 8;

/** Только выбранные пользователем параметры (без "лишних" полей). */
const DNS_PARAM_GROUPS = [
  ['storage_gb', 'storage'],
  ['ram_gb', 'ram'],
  ['os'],
  ['nfc'],
  ['screen_size_range', 'screen_diagonal_inch', 'screen_size'],
  ['ip_rating', 'waterproof'],
  ['refresh_rate'],
  ['processor'],
  ['battery_capacity_bucket', 'battery'],
  ['camera_count_bucket', 'camera'],
  ['display'],
  ['fast_charge_range', 'fast_charge'],
  ['material_basic', 'material'],
  ['network'],
  ['processor_company'],
  ['video_recording', 'video'],
  ['product_model', 'model'],
  ['release_year'],
];

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
  minRating = null,
  setMinRating = () => {},
  reliableModels = false,
  setReliableModels = () => {},
  hasReview = false,
  setHasReview = () => {},
  getBrandCount = () => 0,
  filterChips = [],
  resultCount = null,
  priceCeiling = PRICE_FILTER_CEILING
}) => {
  const [openSections, setOpenSections] = useState({
    availability: true,
    price: true,
    brands: true,
    rating: false
  });

  const [brandQuery, setBrandQuery] = useState('');
  const [brandShowAll, setBrandShowAll] = useState(false);
  const [specExpandKeys, setSpecExpandKeys] = useState({});

  const dnsKeysOrdered = useMemo(() => {
    const ordered = [];
    DNS_PARAM_GROUPS.forEach((group) => {
      const found = group.find((k) => specifications[k]?.length > 0);
      if (found) ordered.push(found);
    });
    return ordered;
  }, [specifications]);

  const hasDnsParams = dnsKeysOrdered.length > 0;

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const allSectionKeys = useMemo(
    () => [
      'availability',
      'price',
      ...(brands.length > 0 ? ['brands'] : []),
      ...(hasDnsParams ? dnsKeysOrdered.map((key) => `param-${key}`) : []),
      'rating'
    ],
    [brands.length, hasDnsParams, dnsKeysOrdered]
  );

  const expandAllSections = useCallback(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      allSectionKeys.forEach((k) => {
        next[k] = true;
      });
      return next;
    });
  }, [allSectionKeys]);

  const collapseAllSections = useCallback(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      allSectionKeys.forEach((k) => {
        next[k] = false;
      });
      return next;
    });
  }, [allSectionKeys]);

  const safeMax = Math.max(priceCeiling, 1);
  const minPriceVal = Array.isArray(priceRange) ? Number(priceRange[0]) || 0 : 0;
  const maxPriceVal = Array.isArray(priceRange) ? Number(priceRange[1]) || safeMax : safeMax;

  const handlePriceRangeChange = (index, value) => {
    const parsed = value === '' ? '' : parseInt(value, 10);
    const newRange = Array.isArray(priceRange) ? [...priceRange] : [0, safeMax];
    let next = Number.isNaN(parsed) ? 0 : parsed;
    if (index === 0) next = Math.min(Math.max(0, next), safeMax);
    else next = Math.min(Math.max(0, next), safeMax);
    newRange[index] = next;
    if (newRange[0] > newRange[1]) {
      if (index === 0) newRange[1] = newRange[0];
      else newRange[0] = newRange[1];
    }
    setPriceRange(newRange);
  };

  const onRangeMinChange = (e) => {
    const v = parseInt(e.target.value, 10);
    const nextMin = Math.min(Math.max(0, v), safeMax);
    const nextMax = Math.max(maxPriceVal, nextMin);
    setPriceRange([nextMin, nextMax]);
  };

  const onRangeMaxChange = (e) => {
    const v = parseInt(e.target.value, 10);
    const nextMax = Math.min(Math.max(0, v), safeMax);
    const nextMin = Math.min(minPriceVal, nextMax);
    setPriceRange([nextMin, nextMax]);
  };

  const handleBrandToggle = (brand) => {
    if (!brand && brand !== 0) return;
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSpecificationToggle = (specKey, value) => {
    setFilters((prev) => {
      const currentValues = Array.isArray(prev[specKey]) ? prev[specKey] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((x) => x !== value)
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

  const toggleSpecExpand = (key) => {
    setSpecExpandKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderKeySection = (key, options = {}) => {
    const { showTitle = true } = options;
    const values = Array.isArray(specifications[key]) ? specifications[key] : [];
    if (values.length === 0) return null;

    const expanded = specExpandKeys[key];
    const visibleValues =
      expanded || values.length <= SPEC_PAGE_SIZE ? values : values.slice(0, SPEC_PAGE_SIZE);

    return (
      <div className="mb-3" key={`wrap-${key}`}>
        {showTitle && <div className="fw-semibold mb-2 filter-subtitle">{getDisplayName(key)}</div>}
        {visibleValues.map((value) => {
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
        {values.length > SPEC_PAGE_SIZE && (
          <button
            type="button"
            className="dns-show-more-btn"
            onClick={() => toggleSpecExpand(key)}
          >
            {expanded ? 'Свернуть' : `Показать всё (${values.length - SPEC_PAGE_SIZE})`}
          </button>
        )}
      </div>
    );
  };

  const pricePresets = [
    [0, 50000],
    [50001, 150000],
    [150001, 400000],
    [400001, 1000000],
    [1000001, PRICE_FILTER_CEILING]
  ];

  const presetActiveIndex = pricePresets.findIndex(
    ([a, b]) => minPriceVal === a && maxPriceVal === b
  );

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => String(b).toLowerCase().includes(q));
  }, [brands, brandQuery]);

  const brandListVisible = brandShowAll ? filteredBrands : filteredBrands.slice(0, BRAND_PAGE_SIZE);
  const brandShowMoreBtn =
    filteredBrands.length > BRAND_PAGE_SIZE && !brandShowAll;

  const SectionHeader = ({ sectionKey, title }) => (
    <button
      type="button"
      className={`dns-section-header ${openSections[sectionKey] ? 'dns-section-open' : ''}`}
      onClick={() => toggleSection(sectionKey)}
      aria-expanded={Boolean(openSections[sectionKey])}
    >
      <h6 className="dns-section-title">{title}</h6>
      <span className="dns-section-icon" aria-hidden>
        ▼
      </span>
    </button>
  );

  const rangeFillLeft = `${(minPriceVal / safeMax) * 100}%`;
  const rangeFillWidth = `${((maxPriceVal - minPriceVal) / safeMax) * 100}%`;

  return (
    <Card className="dns-filters-card">
      <Card.Header className="dns-filters-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 dns-filters-title">
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge bg="primary" className="dns-active-badge">
                {activeFiltersCount}
              </Badge>
            )}
          </h5>
          <div className="d-flex align-items-center gap-2 flex-wrap dns-header-actions">
            <Button
              variant="link"
              size="sm"
              className="dns-aux-btn p-0"
              onClick={expandAllSections}
            >
              Развернуть всё
            </Button>
            <span className="dns-header-sep" aria-hidden>
              |
            </span>
            <Button
              variant="link"
              size="sm"
              className="dns-aux-btn p-0"
              onClick={collapseAllSections}
            >
              Свернуть всё
            </Button>
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
        </div>
        {resultCount != null && (
          <div className="dns-result-hint mt-2">Подходит товаров: {resultCount}</div>
        )}
      </Card.Header>

      <Card.Body className="dns-filters-body">
        <style>{`
          .dns-filters-card {
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
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

          .dns-result-hint {
            font-size: 13px;
            color: #666;
          }

          .dns-active-badge {
            background: #0066ff !important;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
          }

          .dns-header-actions {
            font-size: 14px;
          }

          .dns-aux-btn {
            color: #666 !important;
            font-weight: 500;
            text-decoration: none !important;
            font-size: 13px;
          }

          .dns-aux-btn:hover {
            color: #0066ff !important;
          }

          .dns-header-sep {
            color: #ddd;
            user-select: none;
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

          .dns-filter-chips {
            padding: 12px 20px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .dns-filter-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            font-size: 12px;
            background: #eef4ff;
            color: #1a3a8a;
            border-radius: 999px;
            border: 1px solid #c8d9ff;
            max-width: 100%;
          }

          .dns-filter-chip span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dns-filter-chip button {
            border: none;
            background: transparent;
            padding: 0 0 0 4px;
            line-height: 1;
            font-size: 16px;
            cursor: pointer;
            color: #446;
          }

          .dns-filter-chip button:hover {
            color: #c00;
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
            width: 100%;
            border: none;
            background: none;
            text-align: left;
            padding: 0;
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

          .dns-availability-switch {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 8px 0;
            margin: 0;
            width: 100%;
          }

          .dns-switch {
            position: relative;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
          }
          
          .dns-switch input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            margin: 0;
            cursor: pointer;
            z-index: 2;
          }

          .dns-slider {
            position: absolute;
            pointer-events: none;
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

          .dns-price-range-wrap {
            position: relative;
            height: 28px;
            margin: 8px 0 16px;
          }

          .dns-price-range-track {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 6px;
            background: #e8e8e8;
            border-radius: 3px;
          }

          .dns-price-range-fill {
            position: absolute;
            top: 0;
            height: 100%;
            background: #0066ff;
            border-radius: 3px;
            opacity: 0.35;
            left: ${rangeFillLeft};
            width: ${rangeFillWidth};
          }

          .dns-price-range-input {
            position: absolute;
            left: 0;
            right: 0;
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
            height: 24px;
            margin: 0;
            background: none;
            pointer-events: none;
            -webkit-appearance: none;
            appearance: none;
          }

          .dns-price-range-input::-webkit-slider-thumb {
            pointer-events: auto;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #0066ff;
            border: 2px solid #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,0.25);
            cursor: pointer;
          }

          .dns-price-range-input::-moz-range-thumb {
            pointer-events: auto;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #0066ff;
            border: 2px solid #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,0.25);
            cursor: pointer;
          }

          .dns-price-inputs {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
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
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .dns-price-preset-btn:hover {
            border-color: #0066ff;
            color: #0066ff;
          }

          .dns-price-preset-btn.is-active {
            border-color: #0066ff;
            background: #eef4ff;
            color: #0066ff;
            font-weight: 600;
          }

          .dns-brand-search {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .dns-brand-search:focus {
            border-color: #0066ff;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0,102,255,0.1);
          }

          .dns-filter-list {
            max-height: 320px;
            overflow-y: auto;
            padding-right: 4px;
          }

          .dns-show-more-btn {
            margin-top: 6px;
            padding: 0;
            border: none;
            background: none;
            color: #0066ff;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: underline;
          }

          .dns-show-more-btn:hover {
            color: #004ecc;
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

        {filterChips.length > 0 && (
          <div className="dns-filter-chips" role="list" aria-label="Активные фильтры">
            {filterChips.map((chip) => (
              <div key={chip.key} className="dns-filter-chip" role="listitem">
                <span title={chip.label}>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Снять фильтр: ${chip.label}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="dns-filter-section">
          <SectionHeader sectionKey="availability" title="Наличие" />
          {openSections.availability && (
            <div className="dns-section-content">
              <label className="dns-availability-switch" htmlFor="stock-filter">
                <span className="dns-switch">
                  <input
                    type="checkbox"
                    id="stock-filter"
                    checked={filterInStock}
                    onChange={(e) => setFilterInStock(e.target.checked)}
                  />
                  <span className="dns-slider" aria-hidden />
                </span>
                <span className="dns-switch-label">Только в наличии</span>
              </label>
            </div>
          )}
        </div>

        <div className="dns-filter-section">
          <SectionHeader sectionKey="price" title="Цена, ₽" />
          {openSections.price && (
            <div className="dns-section-content">
              <div className="dns-price-inputs">
                <div className="dns-price-input-group">
                  <label className="dns-price-label" htmlFor="price-min-input">
                    от
                  </label>
                  <input
                    id="price-min-input"
                    type="number"
                    className="dns-price-input"
                    value={minPriceVal}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    min="0"
                    max={safeMax}
                    placeholder="0"
                  />
                </div>
                <div className="dns-price-input-group">
                  <label className="dns-price-label" htmlFor="price-max-input">
                    до
                  </label>
                  <input
                    id="price-max-input"
                    type="number"
                    className="dns-price-input"
                    value={maxPriceVal}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    min="0"
                    max={safeMax}
                    placeholder={PRICE_FILTER_CEILING.toLocaleString('ru-RU')}
                  />
                </div>
              </div>

              <div className="dns-price-range-wrap" aria-hidden={false}>
                <div className="dns-price-range-track" />
                <div className="dns-price-range-fill" />
                <input
                  type="range"
                  className="dns-price-range-input"
                  min={0}
                  max={safeMax}
                  step={safeMax > 5000 ? Math.ceil(safeMax / 500) : 1}
                  value={minPriceVal}
                  onChange={onRangeMinChange}
                  aria-label="Минимальная цена"
                />
                <input
                  type="range"
                  className="dns-price-range-input"
                  min={0}
                  max={safeMax}
                  step={safeMax > 5000 ? Math.ceil(safeMax / 500) : 1}
                  value={maxPriceVal}
                  onChange={onRangeMaxChange}
                  aria-label="Максимальная цена"
                />
              </div>

              <div className="dns-price-presets">
                {pricePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`dns-price-preset-btn ${presetActiveIndex === idx ? 'is-active' : ''}`}
                    onClick={() => setPriceRange(preset)}
                  >
                    {preset[0].toLocaleString('ru-RU')} – {preset[1].toLocaleString('ru-RU')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {brands.length > 0 && (
          <div className="dns-filter-section">
            <SectionHeader sectionKey="brands" title="Бренд" />
            {openSections.brands && (
              <div className="dns-section-content">
                {brands.length > 5 && (
                  <input
                    type="search"
                    className="dns-brand-search"
                    placeholder="Поиск"
                    value={brandQuery}
                    onChange={(e) => {
                      setBrandQuery(e.target.value);
                      setBrandShowAll(false);
                    }}
                    aria-label="Поиск по бренду"
                  />
                )}
                <div className="dns-filter-list">
                  {brandListVisible.map((brand) => {
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
                {brandShowMoreBtn && (
                  <button
                    type="button"
                    className="dns-show-more-btn"
                    onClick={() => setBrandShowAll(true)}
                  >
                    Показать всё ({filteredBrands.length - BRAND_PAGE_SIZE})
                  </button>
                )}
                {brandShowAll && filteredBrands.length > BRAND_PAGE_SIZE && (
                  <button
                    type="button"
                    className="dns-show-more-btn"
                    onClick={() => setBrandShowAll(false)}
                  >
                    Свернуть
                  </button>
                )}
                {filteredBrands.length === 0 && brandQuery && (
                  <div className="text-muted small">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="dns-filter-section">
          <SectionHeader sectionKey="rating" title="Рейтинг и отзывы" />
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

        {hasDnsParams &&
          dnsKeysOrdered.map((key) => {
            const sectionKey = `param-${key}`;
            return (
              <div className="dns-filter-section" key={sectionKey}>
                <SectionHeader sectionKey={sectionKey} title={getDisplayName(key)} />
                {openSections[sectionKey] && (
                  <div className="dns-section-content dns-dns-params-block">
                    {renderKeySection(key, { showTitle: false })}
                  </div>
                )}
              </div>
            );
          })}
      </Card.Body>
    </Card>
  );
};

export default FiltersCard;
