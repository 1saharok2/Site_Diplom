import React from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';

const SortingCard = ({
  sortBy,
  setSortBy,
  onOpenFilters,
  showFilterButton = false,
  resultCount = null,
  activeFiltersCount = 0
}) => {
  return (
    <Card className="sorting-card mb-3">
      <Card.Header className="sorting-card-header-row d-flex flex-wrap align-items-center justify-content-between gap-2">
        <h5 className="mb-0">Каталог</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {resultCount != null && (
            <span className="sorting-result-count text-muted small">
              Найдено: <strong>{resultCount}</strong>
            </span>
          )}
          {showFilterButton && (
            <Button
              variant="primary"
              className="sorting-filters-btn"
              type="button"
              onClick={onOpenFilters}
              aria-label={`Открыть фильтры${activeFiltersCount > 0 ? `. Активных фильтров: ${activeFiltersCount}` : ''}`}
            >
              <span className="sorting-filters-btn-icon" aria-hidden>
                ≡
              </span>
              <span className="sorting-filters-btn-text">Открыть фильтры</span>
              {activeFiltersCount > 0 && (
                <Badge bg="light" text="primary" className="sorting-filters-badge">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="sorting-group">
          <Form.Label className="sorting-label" htmlFor="sort-select">
            Сортировать по:
          </Form.Label>
          <Form.Select
            id="sort-select"
            aria-label="Сортировка товаров"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select-custom"
          >
            <option value="name">По названию</option>
            <option value="price-asc">Цена по возрастанию</option>
            <option value="price-desc">Цена по убыванию</option>
            <option value="rating">По рейтингу</option>
            <option value="newest">Сначала новинки</option>
          </Form.Select>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SortingCard;
