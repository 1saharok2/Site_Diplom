import React from 'react';
import { Card, Form } from 'react-bootstrap';

const SortingCard = ({ sortBy, setSortBy }) => {
  return (
    <Card className="sorting-card mb-3">
      <Card.Header>
        <h5 className="mb-0">Сортировка</h5>
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