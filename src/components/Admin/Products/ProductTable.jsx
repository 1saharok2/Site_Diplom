// components/Admin/Products/ProductTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const ProductTable = ({ products, onEdit, onDelete, onView }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Изображение</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Цена</TableCell>
            <TableCell>Категория</TableCell>
            <TableCell>Наличие</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.price.toLocaleString()} ₽</TableCell>
              <TableCell>
                <Chip label={product.category} size="small" />
              </TableCell>
              <TableCell>{product.stock} шт.</TableCell>
              <TableCell>
                <Chip
                  label={product.isActive ? 'Активен' : 'Неактивен'}
                  color={product.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onView(product)} size="small">
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => onEdit(product)} size="small">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(product.id)} size="small" color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;