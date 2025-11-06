import { lazy } from 'react';

// Ленивая загрузка страниц с предзагрузкой
export const HomePage = lazy(() => 
  import('./Home/HomePage' /* webpackChunkName: "home" */)
);

export const CartPage = lazy(() => 
  import('./Cart/CartPage' /* webpackChunkName: "cart" */)
);

export const CheckoutPage = lazy(() => 
  import('./Checkout/CheckoutPage' /* webpackChunkName: "checkout" */)
);

export const OrderSuccessPage = lazy(() => 
  import('./Orders/OrderSuccessPage' /* webpackChunkName: "orders" */)
);

export const SearchPage = lazy(() => 
  import('./Search/SearchPage' /* webpackChunkName: "search" */)
);

export const OrderDetailPage = lazy(() => 
  import('./Orders/OrderDetailPage' /* webpackChunkName: "orders" */)
);

// Функции для предзагрузки страниц (опционально)
export const preloadPages = {
  home: () => import('./Home/HomePage'),
  cart: () => import('./Cart/CartPage'),
  checkout: () => import('./Checkout/CheckoutPage'),
  search: () => import('./Search/SearchPage'),
};

// Экспорт для статического импорта (если нужно)
export {
  // Мы используем ленивую загрузку, но можно оставить и обычные экспорты
  // для серверного рендеринга или других целей
};