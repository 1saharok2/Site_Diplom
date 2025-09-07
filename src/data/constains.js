export const ORDER_STATUSES = {
  pending: { label: "В обработке", color: "warning" },
  processing: { label: "В обработке", color: "info" },
  shipped: { label: "Отправлен", color: "secondary" },
  delivered: { label: "Доставлен", color: "success" },
  cancelled: { label: "Отменен", color: "error" }
};

export const PRODUCT_CATEGORIES = [
  { value: "smartphones", label: "Смартфоны" },
  { value: "laptops", label: "Ноутбуки" },
  { value: "tablets", label: "Планшеты" },
  { value: "headphones", label: "Наушники" },
  { value: "accessories", label: "Аксессуары" }
];

export const USER_ROLES = {
  admin: "Администратор",
  user: "Пользователь",
  moderator: "Модератор"
};