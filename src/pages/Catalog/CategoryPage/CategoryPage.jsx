import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Spinner, 
  Alert, 
  Form, 
  Button, 
  Breadcrumb 
} from 'react-bootstrap';
import { getCategoryBySlug, getProductsByCategory } from '../../../services/categoryService';
import './CategoryPage.css';

const ProductCard = ({ product }) => (
  <div style={{ border: '1px solid #ccc', padding: '15px', margin: '10px', borderRadius: '5px' }}>
    <h5>{product.name}</h5>
    <p>Цена: {product.price} ₽</p>
    <p>Рейтинг: {product.rating}</p>
  </div>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterInStock, setFilterInStock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoryData, productsData] = await Promise.all([
          getCategoryBySlug(slug),
          getProductsByCategory(slug)
        ]);
        setCategory(categoryData);
        setProducts(productsData);
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

  const filteredAndSortedProducts = products
    .filter(product => !filterInStock || product.inStock)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.isNew - a.isNew;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-3">Загружаем товары...</p>
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
      {/* Хлебные крошки */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Главная</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/catalog" }}>Каталог</Breadcrumb.Item>
          <Breadcrumb.Item active>{category.name}</Breadcrumb.Item>
        </Breadcrumb>

      {/* Заголовок категории */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 fw-bold">{category.name}</h1>
          <p className="lead text-muted">{category.description}</p>
          <p className="text-primary fw-semibold">
            Найдено товаров: {filteredAndSortedProducts.length}
          </p>
        </Col>
      </Row>

      {/* Фильтры и сортировка */}
      <Row className="mb-4">
        <Col md={6} lg={4}>
          <Form.Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="mb-2"
          >
            <option value="name">По названию</option>
            <option value="price-asc">Цена по возрастанию</option>
            <option value="price-desc">Цена по убыванию</option>
            <option value="rating">По рейтингу</option>
            <option value="newest">Сначала новинки</option>
          </Form.Select>
        </Col>
        <Col md={6} lg={4}>
          <Form.Check
            type="switch"
            id="stock-filter"
            label="Только в наличии"
            checked={filterInStock}
            onChange={(e) => setFilterInStock(e.target.checked)}
            className="mt-2"
          />
        </Col>
        <Col lg={4} className="d-none d-lg-block text-end">
          <Button 
            as={Link} 
            to="/catalog" 
            variant="outline-secondary"
            size="sm"
          >
            ← Все категории
          </Button>
        </Col>
      </Row>

      {/* Список товаров */}
      <Row>
        {filteredAndSortedProducts.length === 0 ? (
          <Col>
            <Alert variant="info" className="text-center">
              <Alert.Heading>Товары не найдены</Alert.Heading>
              <p>
                {filterInStock 
                  ? 'Нет товаров в наличии в этой категории' 
                  : 'В этой категории пока нет товаров'
                }
              </p>
              <Button 
                as={Link} 
                to="/catalog" 
                variant="outline-primary"
              >
                Посмотреть другие категории
              </Button>
            </Alert>
          </Col>
        ) : (
          filteredAndSortedProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))
        )}
      </Row>

      {/* Кнопка для мобильных */}
      <div className="d-lg-none text-center mt-4">
        <Button 
          as={Link} 
          to="/catalog" 
          variant="outline-secondary"
          className="w-100"
        >
          ← Вернуться к категориям
        </Button>
      </div>
    </Container>
  );
};

export default CategoryPage;