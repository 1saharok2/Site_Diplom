-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Окт 15 2025 г., 22:33
-- Версия сервера: 8.0.43-34
-- Версия PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `cd371444_dbsite`
--
CREATE DATABASE IF NOT EXISTS `cd371444_dbsite` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `cd371444_dbsite`;

-- --------------------------------------------------------

--
-- Структура таблицы `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `product_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_categories_parent_id` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `product_count`, `is_active`, `created_at`, `parent_id`) VALUES
(1, 'Смартфоны', 'smartphones', 'Смартфоны, кнопочные телефоны и аксессуары', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Smartphones.jpg', 19, 1, '2025-09-09 17:25:35', NULL),
(2, 'Ноутбуки', 'laptops', 'Ноутбуки, ультрабуки и игровые устройства', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Nootebook.png', 2, 1, '2025-09-09 17:25:35', NULL),
(3, 'Телевизоры', 'tvs', 'Телевизоры, мониторы и медиатехника', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Tv.jpg', 1, 1, '2025-09-09 17:25:35', NULL),
(4, 'Наушники', 'headphones', 'Наушники, гарнитуры и аудиотехника', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Headphones.jpg', 1, 1, '2025-09-09 17:25:35', NULL),
(5, 'Фототехника', 'photo', 'Фотоаппараты, объективы и аксессуары', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Photo.jpg', 0, 1, '2025-09-09 17:25:35', NULL),
(6, 'Игровые консоли', 'gaming', 'Игровые приставки, игры и аксессуары', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/GamingConsole.jpg', 0, 1, '2025-09-09 17:25:35', NULL),
(7, 'Бытовая техника', 'appliances', 'Холодильники, стиральные машины и техника для дома', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/Bit.jpeg', 0, 1, '2025-09-09 17:25:35', NULL),
(8, 'Умный дом', 'smarthouse', 'Принадлежности для умного дома', 'https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/Categories/SmartHome.png', 0, 1, '2025-09-13 20:18:45', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `employees`
--

CREATE TABLE IF NOT EXISTS `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `position` varchar(100) DEFAULT 'sales_assistant',
  `store_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `store_id` (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `first_name`, `last_name`, `position`, `store_id`, `is_active`, `created_at`) VALUES
(1, 'cb7bca23-945c-4b97-b016-1db63e2b4118', 'Иван', 'Петров', 'sales_assistant', 1, 0, '2025-09-09 17:52:16');

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(100) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `store_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `store_id` (`store_id`),
  KEY `employee_id` (`employee_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `customer_email`, `total_amount`, `status`, `store_id`, `employee_id`, `user_id`, `created_at`, `updated_at`) VALUES
(23, 'ORD-1758650418785-347XZ', 'Ivan', '+79999999999', 'admin@mail.com', 79990.00, '', NULL, NULL, '4d70129c-33d0-4379-ab10-24c64a3e30a9', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(24, 'ORD-1758747847288-J918A', 'Ivan', '+79999999999', 'admin@mail.com', 239970.00, 'cancelled', NULL, NULL, '4d70129c-33d0-4379-ab10-24c64a3e30a9', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_order_items_order_id` (`order_id`)
) ;

--
-- Дамп данных таблицы `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `name`, `image`, `created_at`) VALUES
(38, 23, 34, 1, 79990.00, 'Смартфон Apple iPhone 16 128GB Белый', NULL, '0000-00-00 00:00:00'),
(39, 24, 32, 1, 79990.00, 'Смартфон Apple iPhone 16 128GB Чёрный', NULL, '0000-00-00 00:00:00'),
(40, 24, 38, 1, 79990.00, 'Смартфон Apple iPhone 16 128GB Синий', NULL, '0000-00-00 00:00:00'),
(41, 24, 36, 1, 79990.00, 'Смартфон Apple iPhone 16 128GB Розовый', NULL, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `products`
--

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `description` text,
  `category_slug` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `reviews_count` int DEFAULT '0',
  `is_new` tinyint(1) DEFAULT '0',
  `discount` int DEFAULT '0',
  `stock` int DEFAULT '0',
  `specifications` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `image_url` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_products_category_slug` (`category_slug`),
  KEY `idx_products_price` (`price`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `price`, `old_price`, `description`, `category_slug`, `brand`, `rating`, `reviews_count`, `is_new`, `discount`, `stock`, `specifications`, `is_active`, `created_at`, `updated_at`, `image_url`) VALUES
(2, 'Смартфон Samsung Galaxy S23 Ultra', 'samsung-galaxy-s23-ultra', 89900.00, 99900.00, 'Samsung Galaxy S23 Ultra — флагман для тех, кто требует максимальной камеры и функционала. Большой Dynamic AMOLED 2X дисплей 6.8\" 120 Гц, мощная платформа Snapdragon 8 Gen 2 и аккумулятор 5000 мАч обеспечивают производительность и длительную автономность. Встроенный S-Pen, продвинутая камера 200 Мп и премиальные материалы корпуса делают устройство отличным выбором для работы и творчества.', 'smartphones', 'Samsung', 4.50, 256, 0, 10, 18, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano + eSIM)\", \"wifi\": \"Wi-Fi 6E\", \"color\": \"Phantom Black\", \"video\": \"8K@30fps, 4K@60fps\", \"camera\": \"200 Мп (основная) + 10 Мп (перископ 10x) + 10 Мп (теле 3x) + 12 Мп (ультраширокая)\", \"weight\": \"234 г\", \"battery\": \"5000 мАч\", \"display\": \"Dynamic AMOLED 2X\", \"network\": \"5G, LTE, Wi-Fi 6E\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass Victus 2 + алюминий\", \"security\": \"Ультразвуковой сканер отпечатков\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (One UI 5.1)\", \"resolution\": \"3088x1440\", \"waterproof\": \"IP68\", \"fast_charge\": \"45W\", \"screen_size\": \"6.8\\\"\", \"front_camera\": \"12 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"15W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Samsung/Samsung%20Galaxy%20S23%20Ultra.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL1NhbXN1bmcvU2Ftc3VuZyBHYWxheHkgUzIzIFVsdHJhLnBuZyIsImlhdCI6MTc1ODAxNDY2MywiZXhwIjoxNzg5NTUwNjYzfQ.ly3rlLEIP2CCwHvKWhl-jgBLHjjH7ON_JeLaK0gYeyQ\"]'),
(3, 'Смартфон Xiaomi Redmi Note 13', 'xiaomi-redmi-note-13', 24990.00, 29990.00, 'Redmi Note 13 сочетает современный AMOLED-дисплей и сбалансированную «железную» платформу, предлагая отличное соотношение цены и качества. Камера 64 Мп и ёмкая батарея 5000 мАч с быстрой зарядкой 33W подойдут для повседневной съёмки и долгой работы без подзарядки. Компактный и лёгкий корпус с защитой от брызг делает устройство удобным в повседневном использовании.', 'smartphones', 'Xiaomi', 4.20, 189, 0, 17, 32, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"color\": \"Синий\", \"video\": \"4K@30fps\", \"camera\": \"64 Мп (основная) + 8 Мп (ультраширокая) + 2 Мп (макро)\", \"weight\": \"181 г\", \"battery\": \"5000 мАч\", \"display\": \"AMOLED\", \"network\": \"5G, LTE\", \"storage\": \"128 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер отпечатков в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Dimensity 920\", \"os_version\": \"13 (MIUI 14)\", \"resolution\": \"2400x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"33W\", \"screen_size\": \"6.43\\\"\", \"front_camera\": \"16 Мп\", \"refresh_rate\": \"90 Гц\", \"wireless_charge\": false}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Xiaomi/Xiaomi%20Redmi%20Note%2013.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL1hpYW9taS9YaWFvbWkgUmVkbWkgTm90ZSAxMy5wbmciLCJpYXQiOjE3NTgwMTQ3MDIsImV4cCI6MTc4OTU1MDcwMn0.UBr-_zWcOY7Bu6y5FCgB6Pp2Xwl0Wmj6llUOk3HuUEk\"]'),
(4, 'Смартфон Google Pixel 8 Pro', 'google-pixel-8-pro', 89990.00, 99990.00, 'Google Pixel 8 Pro — смартфон с упором на вычислительную фотографию и чистый Android. Tensor G3 обеспечивает адаптивные функции ИИ, а комбинация камер даёт отличные снимки при любой освещённости. Долгосрочные обновления системы и удобный интерфейс делают устройство привлекательным для пользователей, которые ценят софт и качество фото.', 'smartphones', 'Google', 4.70, 89, 0, 10, 12, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"1 SIM (eSIM)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Snow\", \"video\": \"4K@60fps\", \"camera\": \"50 Мп (широкая) + 48 Мп (ультраширокая) + 48 Мп (теле)\", \"weight\": \"213 г\", \"battery\": \"5050 мАч\", \"display\": \"LTPO OLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"128 ГБ\", \"material\": \"Gorilla Glass + алюминий\", \"security\": \"Сканер в экране + Face Unlock\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Google Tensor G3\", \"os_version\": \"14\", \"resolution\": \"2992x1344\", \"waterproof\": \"IP68\", \"ai_features\": \"Magic Eraser, улучшенная ИИ-обработка фото\", \"fast_charge\": \"30W\", \"screen_size\": \"6.7\\\"\", \"front_camera\": \"10.8 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"23W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Google/Google_Pixel_8_Pro.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0dvb2dsZS9Hb29nbGVfUGl4ZWxfOF9Qcm8ucG5nIiwiaWF0IjoxNzU4MDE0NTUzLCJleHAiOjE3ODk1NTA1NTN9.QiCBl4cenjKetxxO0tnuwDJ5izJ9_ue2uERV5Jl6Bjg\"]'),
(5, 'Смартфон OnePlus 12', 'oneplus-12', 69990.00, 79990.00, 'OnePlus 12 — флагман для тех, кто ценит скорость и отзывчивость. Большой LTPO AMOLED-экран 6.82\" с высокой чёткостью и частотой обновления в 120 Гц, а также топовый чип Snapdragon 8 Gen 3 обеспечивают отличная производительность в играх и многозадачности. Молниеносная зарядка 100W и поддержка беспроводной зарядки делают устройство удобным в повседневном использовании.', 'smartphones', 'OnePlus', 4.60, 156, 0, 12, 20, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"16 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Silver\", \"video\": \"8K@24fps, 4K@120fps\", \"camera\": \"50 Мп (основная) + 48 Мп (ультраширокая) + 64 Мп (теле)\", \"weight\": \"220 г\", \"battery\": \"5400 мАч\", \"display\": \"LTPO AMOLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass Victus 2 + алюминиевая рамка\", \"security\": \"Сканер в экране, Alert Slider\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.4\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 3\", \"os_version\": \"14 (OxygenOS 14)\", \"resolution\": \"3168x1440\", \"waterproof\": \"IP65\", \"fast_charge\": \"100W\", \"screen_size\": \"6.82\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"50W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Oneplus/OnePlus%2012.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL09uZXBsdXMvT25lUGx1cyAxMi5wbmciLCJpYXQiOjE3NTgwMTQ2MjYsImV4cCI6MTc4OTU1MDYyNn0.i5n796zvQS8eiXS9dxqD_ozs238XWGJUK-fzJ5fRyu4\"]'),
(6, 'Смартфон Huawei P60 Pro', 'huawei-p60-pro', 84990.00, 94990.00, 'Huawei P60 Pro — премиальный смартфон с акцентом на оптику и съёмку. Мощная основная система камер, большой OLED-экран и крупный аккумулятор позволяют получать качественные кадры и долгую автономность. Устройство на HarmonyOS ориентировано на пользователей, которым важны камера и дизайн; обратите внимание, что модель может иметь особенности по поддержке сетей и сервисов в зависимости от региона.', 'smartphones', 'Huawei', 4.50, 78, 0, 11, 8, '{\"os\": \"HarmonyOS\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"Rococo Pearl\", \"video\": \"4K@60fps\", \"camera\": \"48 Мп (основная) + 48 Мп (перископ/теле) + 13 Мп (ультраширокая)\", \"weight\": \"200 г\", \"battery\": \"4815 мАч\", \"display\": \"OLED\", \"network\": \"4G/LTE (варианты в зависимости от региона)\", \"storage\": \"256 ГБ\", \"material\": \"Стекло + металлическая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8+ Gen 1\", \"os_version\": \"3.1\", \"resolution\": \"2700x1228\", \"waterproof\": \"IP68\", \"fast_charge\": \"88W\", \"screen_size\": \"6.67\\\"\", \"front_camera\": \"13 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"50W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Huawei/Huawei%20P60%20Pro.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0h1YXdlaS9IdWF3ZWkgUDYwIFByby5wbmciLCJpYXQiOjE3NTgwMTQ1NzEsImV4cCI6MTc4OTU1MDU3MX0.fvoD78vQIS6Wnqx-RgusetltylnPAhaS815Jv4_qdcU\"]'),
(10, 'Смартфон Nothing Phone (2)', 'nothing-phone-2', 54990.00, 64990.00, 'Nothing Phone (2) выделяется необычным дизайном и фирменным световым интерфейсом Glyph. Устройство сочетает прозрачную заднюю панель с информативной LED-подсветкой, мощную платформу и хороший набор камер для мобильной съёмки. Подойдёт тем, кто хочет заметный внешний вид и современный набор функций по разумной цене.', 'smartphones', 'Nothing', 4.20, 187, 0, 15, 22, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"White\", \"video\": \"4K@60fps\", \"camera\": \"50 Мп (основная) + 50 Мп (ультраширокая)\", \"weight\": \"201 г\", \"battery\": \"4700 мАч\", \"display\": \"OLED\", \"network\": \"5G, LTE\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass + алюминий\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8+ Gen 1\", \"os_version\": \"13 (Nothing OS 2.0)\", \"resolution\": \"2412x1080\", \"waterproof\": \"IP54\", \"fast_charge\": \"45W\", \"screen_size\": \"6.7\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"glyph_interface\": \"Светодиодная подсветка (Glyph)\", \"wireless_charge\": \"15W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Nothing/Nothing%20Phone%202.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL05vdGhpbmcvTm90aGluZyBQaG9uZSAyLnBuZyIsImlhdCI6MTc1ODAxNDYxNywiZXhwIjoxNzg5NTUwNjE3fQ.oakd-LIr76umx3KACdSRtUfmL7AdmYhkvqPiT2XNQFk\"]'),
(12, 'Смартфон Honor Magic 5', 'honor-magic-5', 59990.00, 69990.00, 'Honor Magic 5 — универсальный флагман с мощной аппаратной частью и большим экраном, ориентирован на творческую работу и контент. Камерная система обеспечивает детализированные снимки, а ёмкий аккумулятор и быстрая зарядка дают уверенную автономность. Приятный дизайн и хороший набор коммуникаций делают телефон удобным для повседневного использования.', 'smartphones', 'Honor', 4.30, 116, 0, 14, 19, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"Blue\", \"video\": \"4K@60fps\", \"camera\": \"54 Мп (широкая) + 50 Мп (ультраширокая) + 32 Мп (теле)\", \"weight\": \"191 г\", \"battery\": \"5100 мАч\", \"display\": \"OLED\", \"network\": \"5G, LTE\", \"storage\": \"256 ГБ\", \"material\": \"Стекло + алюминиевая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (MagicOS 7.1)\", \"resolution\": \"2688x1224\", \"waterproof\": \"IP54\", \"fast_charge\": \"66W\", \"screen_size\": \"6.73\\\"\", \"front_camera\": \"12 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Honor/honor_magic5.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0hvbm9yL2hvbm9yX21hZ2ljNS5qcGciLCJpYXQiOjE3NTgwMTY1OTMsImV4cCI6MTc4OTU1MjU5M30.G3uyM1T4T6Joa66ylhox3PTfRzai1SaMmxUtZdzBTKY\"]'),
(13, 'Смартфон ASUS ROG Phone 7', 'asus-rog-phone-7', 89990.00, 99990.00, 'ASUS ROG Phone 7 — специализированный игровой смартфон с акцентом на производительность и охлаждение. Массивная батарея 6000 мАч, частота экрана до 165 Гц и поддержка активного охлаждения дают длительные игровые сессии без троттлинга. Дополнительные игровые фичи (AirTrigger, оптимизация ПО) делают устройство лучшим выбором для мобильных геймеров.', 'smartphones', 'ASUS', 4.80, 201, 0, 10, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"16 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Black\", \"video\": \"8K@24fps\", \"camera\": \"50 Мп (основная) + 13 Мп (ультраширокая) + 5 Мп (макро)\", \"weight\": \"239 г\", \"battery\": \"6000 мАч\", \"display\": \"AMOLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"512 ГБ\", \"material\": \"Стекло + металлическая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (ROG UI)\", \"resolution\": \"2448x1080\", \"waterproof\": \"IP54\", \"fast_charge\": \"65W\", \"screen_size\": \"6.78\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"165 Гц\", \"gaming_features\": \"Активное охлаждение, AirTrigger\", \"wireless_charge\": false}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/ASUS/asus_rogphone7.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FTVVMvYXN1c19yb2dwaG9uZTcuanBnIiwiaWF0IjoxNzU4MDE0NTMzLCJleHAiOjE3ODk1NTA1MzN9.aTRo3fqT087mDIG3BNd5T4F0O3aQ6Q31tjacySylSj0\"]'),
(16, 'Смартфон Tecno Camon 20', 'tecno-camon-20', 19990.00, 24990.00, 'Tecno Camon 20 — бюджетный смартфон с акцентом на съёмку и автономность. Большой экран 6.67\" и аккумулятор 5000 мАч обеспечивают комфортный просмотр видео и долгую работу без подзарядки. Для своей цены модель предлагает приличный набор камер и достаточный объём памяти.', 'smartphones', 'Tecno', 3.90, 267, 0, 20, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"color\": \"Blue\", \"video\": \"1440p@30fps\", \"camera\": \"64 Мп (основная) + 2 Мп (макро) + 2 Мп (глубина)\", \"weight\": \"190 г\", \"battery\": \"5000 мАч\", \"display\": \"IPS LCD\", \"network\": \"4G LTE\", \"storage\": \"256 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер в боковой кнопке\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.0\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Helio G99\", \"os_version\": \"13 (HIOS)\", \"resolution\": \"2460x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"33W\", \"screen_size\": \"6.67\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Techno/techno_camon20.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL1RlY2huby90ZWNobm9fY2Ftb24yMC5qcGciLCJpYXQiOjE3NTgwMTQ2ODIsImV4cCI6MTc4OTU1MDY4Mn0.LEYZbeY0a7QP_HJU8H0_dDgfgHHxYSAzPEf00_keFD0\"]'),
(17, 'Смартфон Infinix Note 30', 'infinix-note-30', 17990.00, 22990.00, 'Infinix Note 30 предлагает большой AMOLED-экран и ёмкую батарею в доступном ценовом сегменте. Камера 108 Мп обеспечивает высокую детальность при хорошем освещении, а фирменные аудиотехнологии улучшают звучание мультимедиа. Устройство подойдёт пользователям, которым нужен большой экран и долгий экран-время работы.', 'smartphones', 'Infinix', 3.80, 189, 0, 22, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"audio\": \"Стереодинамики JBL\", \"color\": \"Black\", \"video\": \"1440p@30fps\", \"camera\": \"108 Мп (основная) + 2 Мп (макро) + 2 Мп (глубина)\", \"weight\": \"195 г\", \"battery\": \"5000 мАч\", \"display\": \"AMOLED\", \"network\": \"4G LTE\", \"storage\": \"256 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Helio G99\", \"os_version\": \"13 (XOS)\", \"resolution\": \"2400x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"45W\", \"screen_size\": \"6.78\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Infinix/infinix_note30.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0luZmluaXgvaW5maW5peF9ub3RlMzAucG5nIiwiaWF0IjoxNzU4MDE0NTkxLCJleHAiOjE3ODk1NTA1OTF9.drVZ1fa2VJLafQ9HL9Ct2iRfZ0wjySAX9yFxx3b53FM\"]'),
(19, 'Смартфон LG Velvet 2', 'lg-velvet-2', 39990.00, 49990.00, 'LG Velvet 2 сочетает утончённый дизайн и качественный звук, подходящий для мультимедиа и повседневных задач. Большой P-OLED экран и сбалансированный процессор дают приятное визуальное впечатление и плавную работу интерфейса. Устройство ориентировано на пользователей, которым важны комфорт просмотра и качественный аудио-опыт.', 'smartphones', 'LG', 4.20, 73, 0, 20, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"audio\": \"Стереодинамики, 3.5 mm jack\", \"color\": \"Aurora Gray\", \"video\": \"4K@30fps\", \"camera\": \"64 Мп (основная) + 8 Мп (ультраширокая) + 5 Мп (глубина)\", \"weight\": \"180 г\", \"battery\": \"4300 мАч\", \"display\": \"P-OLED\", \"network\": \"5G, LTE\", \"storage\": \"128 ГБ\", \"material\": \"Стекло + пластиковая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.1\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 778G\", \"os_version\": \"12\", \"resolution\": \"2460x1080\", \"waterproof\": \"IP68\", \"fast_charge\": \"25W\", \"screen_size\": \"6.8\\\"\", \"front_camera\": \"16 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"10W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/LG/lg_velvet2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0xHL2xnX3ZlbHZldDIucG5nIiwiaWF0IjoxNzU4MDE0NjAyLCJleHAiOjE3ODk1NTA2MDJ9.0ai-anhricQt9ynuwDCUJuthwuqDA-LRvwsZso_Fd94\"]'),
(24, 'Ноутбук Apple MacBook Pro 16\"', 'apple-macbook-pro-16', 199990.00, 219990.00, 'MacBook Pro 16\" — профессиональный ноутбук для творческих задач и тяжёлых рабочих нагрузок. M2 Pro обеспечивает серьёзную производительность в рендеринге, монтаже и разработке, а экран Liquid Retina XDR даёт точную цветопередачу. Богатый набор портов и длительное время автономной работы делают модель отличным выбором для профессионалов.', 'laptops', 'Apple', 4.80, 89, 0, 9, 5, '{\"os\": \"macOS\", \"ram\": \"16 ГБ\", \"audio\": \"6-динамиковая система, пространственный звук\", \"color\": \"Space Gray\", \"ports\": \"3x Thunderbolt 4, HDMI, SDXC, MagSafe 3\", \"webcam\": \"1080p FaceTime HD\", \"weight\": \"2.15 кг\", \"battery\": \"100 Вт·ч\", \"display\": \"Liquid Retina XDR\", \"storage\": \"512 ГБ SSD\", \"graphics\": \"19-core GPU\", \"keyboard\": \"Backlit Magic Keyboard\", \"security\": \"Touch ID\", \"trackpad\": \"Force Touch\", \"warranty\": \"12 месяцев\", \"wireless\": \"Wi-Fi 6E, Bluetooth 5.3\", \"processor\": \"Apple M2 Pro (12-core)\", \"os_version\": \"Ventura\", \"resolution\": \"3456x2234\", \"screen_size\": \"16.2\\\"\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Laptops/Apple/mackbook_pro16.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvTGFwdG9wcy9BcHBsZS9tYWNrYm9va19wcm8xNi5qcGciLCJpYXQiOjE3NTgwMTQ1MDIsImV4cCI6MTc4OTU1MDUwMn0.KriUYVdKhEH8srTnSkFnoCe83RsMvMoOiiB8GjFSFAk\"]'),
(25, 'Ноутбук ASUS ROG Strix', 'asus-rog-strix', 129990.00, 149990.00, 'ASUS ROG Strix — мощный игровой ноутбук с акцентом на производительность и охлаждение. Конфигурация с Intel Core i9 и RTX 4080 позволяет запускать современные игры на высоких настройках, а продвинутая система охлаждения сохраняет стабильность при длительных сессиях. Подходит для геймеров и контент-креаторов, которым нужна мобильная рабочая станция.', 'laptops', 'ASUS', 4.60, 67, 0, 13, 0, '{\"os\": \"Windows 11\", \"ram\": \"32 ГБ DDR5\", \"audio\": \"2x 2W speakers, Dolby Atmos\", \"color\": \"Black\", \"ports\": \"2x USB-C (Thunderbolt 4), 3x USB-A, HDMI 2.1, RJ45\", \"webcam\": \"720p\", \"weight\": \"3.0 кг\", \"battery\": \"90 Вт·ч\", \"cooling\": \"2 вентилятора, 5 теплотрубок\", \"display\": \"IPS\", \"storage\": \"1 ТБ SSD NVMe\", \"graphics\": \"NVIDIA GeForce RTX 4080 12GB\", \"keyboard\": \"RGB per-key\", \"warranty\": \"24 месяца\", \"wireless\": \"Wi-Fi 6E, Bluetooth 5.2\", \"processor\": \"Intel Core i9-13980HX\", \"os_version\": \"Pro\", \"resolution\": \"2560x1440\", \"screen_size\": \"17.3\\\"\", \"refresh_rate\": \"240 Гц\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Laptops/ASUS/asus_rogstrix.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvTGFwdG9wcy9BU1VTL2FzdXNfcm9nc3RyaXgucG5nIiwiaWF0IjoxNzU4MDE0NTE0LCJleHAiOjE3ODk1NTA1MTR9.9F9MSbhexbXvp5jLBOFKliBgqC3jI8WTK8J1hqayoaI\"]'),
(26, 'Телевизор Samsung QLED 65\"', 'samsung-qled-65', 89990.00, 109990.00, 'Samsung QLED 65\" — 4K телевизор с насыщенной цветопередачей и поддержкой HDR10+. Подойдёт как для домашнего кинотеатра, так и для игр: низкая задержка, режим Game Mode и HDMI 2.1. Умные функции на базе Tizen и голосовые ассистенты делают управление удобным и гибким.', 'tvs', 'Samsung', 4.70, 145, 0, 18, 12, '{\"os\": \"Tizen\", \"hdr\": \"HDR10+, HLG\", \"usb\": \"2x USB\", \"hdmi\": \"4x HDMI 2.1\", \"wifi\": \"Wi-Fi 5\", \"sound\": \"40W, 2.1ch, Dolby Atmos\", \"weight\": \"23.5 кг\", \"display\": \"QLED\", \"diagonal\": \"65\\\"\", \"smart_tv\": true, \"warranty\": \"24 месяца\", \"bluetooth\": \"4.2\", \"resolution\": \"3840x2160 (4K)\", \"wall_mount\": \"VESA 400x300\", \"energy_class\": \"A\", \"refresh_rate\": \"120 Гц\", \"voice_control\": \"Bixby, Alexa, Google Assistant\", \"gaming_features\": \"Game Mode, FreeSync Premium\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/TVs/Samsung/samsung_qled65.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvVFZzL1NhbXN1bmcvc2Ftc3VuZ19xbGVkNjUuanBnIiwiaWF0IjoxNzU4MDE0NzE1LCJleHAiOjE3ODk1NTA3MTV9._CvJCAc5fDj74aH_WoPJyoOX-VCK9xc77EyPTR9WL3o\"]'),
(27, 'Наушники Sony WH-1000XM5', 'sony-wh-1000xm5', 29990.00, 34990.00, 'Sony WH-1000XM5 — флагманские беспроводные наушники с выдающимся активным шумоподавлением и отличным звуком. До 30 часов работы от батареи, удобная посадка и сенсорное управление делают их комфортными для длительного использования. Поддержка LDAC и интеграция с голосовыми ассистентами обеспечивают высокое качество прослушивания и удобство управления.', 'headphones', 'Sony', 4.90, 312, 0, 14, 30, '{\"case\": \"Чехол для переноски\", \"type\": \"Накладные беспроводные\", \"color\": \"Black\", \"weight\": \"250 г\", \"battery\": \"До 30 часов (ANC включено)\", \"charging\": \"Быстрая зарядка: 3 мин = 3 часа\", \"features\": \"Сенсорное управление, голосовые помощники\", \"foldable\": \"Да\", \"warranty\": \"24 месяца\", \"microphones\": \"Множество микрофонов для звонков и ANC\", \"audio_codecs\": \"LDAC, AAC, SBC\", \"connectivity\": \"Bluetooth 5.2\", \"noise_canceling\": \"Адаптивное активное шумоподавление\", \"water_resistance\": \"IPX4 (защита от брызг)\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Headphones/Sony/sony_wh-1000xm5.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvSGVhZHBob25lcy9Tb255L3Nvbnlfd2gtMTAwMHhtNS5qcGVnIiwiaWF0IjoxNzU4MDE0NDg3LCJleHAiOjE3ODk1NTA0ODd9.FESyBFxjR6OZtpYBhx4cDCgsAeH7tQnv7_nhYArte8s\"]'),
(32, 'Смартфон Apple iPhone 16 128GB Чёрный', 'apple-iphone-16-128gb-black', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.80, 45, 0, 6, 15, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Черный\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDIpLmpwZyIsImlhdCI6MTc1ODMxNjYzOCwiZXhwIjoxNzg5ODUyNjM4fQ.gODu-os7csKt3_t4ZgAGkxTrCQgotSJ3mYdtaNpwFXY\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDMpLmpwZyIsImlhdCI6MTc1ODMxNjY3NiwiZXhwIjoxNzg5ODUyNjc2fQ.tAR_zeAil2DiDTYswuJOP9YnBMJahvZn7JIPV9dYOdw\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDQpLmpwZyIsImlhdCI6MTc1ODMxNjY5NywiZXhwIjoxNzg5ODUyNjk3fQ.LTwaPxfriJng75fW4IqrMYKa-5J0L_A_P1ZH1Dr56yA\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2suanBnIiwiaWF0IjoxNzU4MzE2NzE0LCJleHAiOjE3ODk4NTI3MTR9.hJkfc58CswVDJ-ISKeD7G-pUdGxcUwmv2FfpDiF57gc\"]'),
(33, 'Смартфон Apple iPhone 16 256GB Чёрный', 'apple-iphone-16-256gb-black', 89990.00, 94990.00, 'Apple iPhone 16 в классическом черном цвете. Строгий и элегантный дизайн, который подчеркивает статусность устройства. 8 ГБ оперативной памяти обеспечивают плавную работу даже самых требовательных приложений.', 'smartphones', 'Apple', 4.80, 32, 0, 5, 12, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Черный\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDIpLmpwZyIsImlhdCI6MTc1ODMxNjYzOCwiZXhwIjoxNzg5ODUyNjM4fQ.gODu-os7csKt3_t4ZgAGkxTrCQgotSJ3mYdtaNpwFXY\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDMpLmpwZyIsImlhdCI6MTc1ODMxNjY3NiwiZXhwIjoxNzg5ODUyNjc2fQ.tAR_zeAil2DiDTYswuJOP9YnBMJahvZn7JIPV9dYOdw\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2sgKDQpLmpwZyIsImlhdCI6MTc1ODMxNjY5NywiZXhwIjoxNzg5ODUyNjk3fQ.LTwaPxfriJng75fW4IqrMYKa-5J0L_A_P1ZH1Dr56yA\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20black/iphone_16_black.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibGFjay9pcGhvbmVfMTZfYmxhY2suanBnIiwiaWF0IjoxNzU4MzE2NzE0LCJleHAiOjE3ODk4NTI3MTR9.hJkfc58CswVDJ-ISKeD7G-pUdGxcUwmv2FfpDiF57gc\"]'),
(34, 'Смартфон Apple iPhone 16 128GB Белый', 'apple-iphone-16-128gb-white', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.70, 38, 0, 6, 18, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Белый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkgKDIpLmpwZyIsImlhdCI6MTc1ODMxNzEyNSwiZXhwIjoxNzg5ODUzMTI1fQ.JJ9tfTM3__SrZFFcDRewquztUn4_3yuW6R2rcHd3ers\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkgKDMpLmpwZyIsImlhdCI6MTc1ODMxNzE0NCwiZXhwIjoxNzg5ODUzMTQ0fQ.vxupLxGsN4RyMwbKKp9lOehm9DMQGnrYy7CBvC8Ey2g\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkuanBnIiwiaWF0IjoxNzU4MzE3MTU2LCJleHAiOjE3ODk4NTMxNTZ9.lrkA8TFHVxbjcd4NoRB5CCdBurtVVi3FtnqtcARg4ic\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGli0ZS9pcGhvbmVfMTZfYmVseXkgKDQpLmpwZyIsImlhdCI6MTc1ODMxNzE2NSwiZXhwIjoxNzg5ODUzMTY1fQ.EV90Jw7U4dfmDeiERqemt71Y9IN0wTw7TaD6obno9P4\"]'),
(35, 'Смартфон Apple iPhone 16 256GB Белый', 'apple-iphone-16-256gb-white', 89990.00, 94990.00, 'Apple iPhone 16 в белом цвете. Чистый и свежий дизайн, который символизирует современность и технологичность. 8 ГБ оперативной памяти для многозадачности и высокой производительности.', 'smartphones', 'Apple', 4.75, 28, 0, 5, 14, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Белый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkgKDIpLmpwZyIsImlhdCI6MTc1ODMxNzEyNSwiZXhwIjoxNzg5ODUzMTI1fQ.JJ9tfTM3__SrZFFcDRewquztUn4_3yuW6R2rcHd3ers\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkgKDMpLmpwZyIsImlhdCI6MTc1ODMxNzE0NCwiZXhwIjoxNzg5ODUzMTQ0fQ.vxupLxGsN4RyMwbKKp9lOehm9DMQGnrYy7CBvC8Ey2g\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkuanBnIiwiaWF0IjoxNzU4MzE3MTU2LCJleHAiOjE3ODk4NTMxNTZ9.lrkA8TFHVxbjcd4NoRB5CCdBurtVVi3FtnqtcARg4ic\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20white/iphone_16_belyy%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiB3aGl0ZS9pcGhvbmVfMTZfYmVseXkgKDQpLmpwZyIsImlhdCI6MTc1ODMxNzE2NSwiZXhwIjoxNzg5ODUzMTY1fQ.EV90Jw7U4dfmDeiERqemt71Y9IN0wTw7TaD6obno9P4\"]'),
(36, 'Смартфон Apple iPhone 16 128GB Розовый', 'apple-iphone-16-128gb-pink', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.65, 42, 0, 6, 10, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Розовый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(2).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(3).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(4).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink.jpg\"]'),
(37, 'Смартфон Apple iPhone 16 256GB Розовый', 'apple-iphone-16-256gb-pink', 89990.00, 94990.00, 'Apple iPhone 16 в нежном розовом цвете. Стильный и современный смартфон для ярких личностей. 8 ГБ оперативной памяти обеспечивают быстродействие системы.', 'smartphones', 'Apple', 4.68, 25, 0, 5, 7, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Розовый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaGluZSAxNiBwaW5rL2lwaG9uZV8xNl9waW5r%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaGluZSAxNiBwaW5rL2lwaG9uZV8xNl9waW5r%20(2).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaGluZSAxNiBwaW5rL2lwaG9uZV8xNl9waW5r%20(3).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaGluZSAxNiBwaW5rL2lwaG9uZV8xNl9waW5r%20(4).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphine%2016%20pink/iphone_16_pink.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaGluZSAxNiBwaW5rL2lwaG9uZV8xNl9waW5r.jpg\"]');
INSERT INTO `products` (`id`, `name`, `slug`, `price`, `old_price`, `description`, `category_slug`, `brand`, `rating`, `reviews_count`, `is_new`, `discount`, `stock`, `specifications`, `is_active`, `created_at`, `updated_at`, `image_url`) VALUES
(38, 'Смартфон Apple iPhone 16 128GB Синий', 'apple-iphone-16-128gb-blue', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.72, 35, 0, 6, 12, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Синий\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(3).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(2).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl.jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(4).jpg\"]'),
(39, 'Смартфон Apple iPhone 16 256GB Синий', 'apple-iphone-16-256gb-blue', 89990.00, 94990.00, 'Apple iPhone 16 в насыщенном синем цвете. Выразительный дизайн с высокой производительностью. 8 ГБ оперативной памяти для комфортной работы и игр.', 'smartphones', 'Apple', 4.75, 22, 0, 5, 9, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Синий\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '[\"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(3).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(3).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(2).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(2).jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl.jpg\", \"https://lpdpyyibqkzmchoxdema.supabase.co/storage/v1/object/sign/images/products/Phones/Apple/Iphone%2016%20blue/iphone_16_blue%20(4).jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMmJiYmI4MS04MDMxLTQ4NGQtYTI0OC02YTY3MDZkY2Y4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZHVjdHMvUGhvbmVzL0FwcGxlL0lwaG9uZSAxNiBibHVlL2lwaG9uZV8xNl9ibHVl%20(4).jpg\"]');

-- --------------------------------------------------------

--
-- Структура таблицы `reviews`
--

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `product_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product_id` (`product_id`),
  KEY `idx_reviews_user_id` (`user_id`)
) ;

-- --------------------------------------------------------

--
-- Структура таблицы `stores`
--

CREATE TABLE IF NOT EXISTS `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `opening_hours` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `stores`
--

INSERT INTO `stores` (`id`, `name`, `address`, `phone`, `email`, `opening_hours`, `is_active`, `created_at`) VALUES
(1, 'Главный магазин TechStore', 'г. Курск, ул. Белгородская, д. 14', '+7 (495) 123-45-67', 'info@techstore.ru', 'Пн-Пт: 10:00-22:00, Сб-Вс: 10:00-23:00', 0, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('admin','sales_assistant','customer') DEFAULT 'customer',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` text,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `avatar_url`, `role`, `is_active`, `created_at`, `address`, `updated_at`) VALUES
('120c29dc-5d2f-4157-91d3-89802d0aec44', 'user@mail.com', '$2b$12$tqbZ3KBffGqyb3lZURcAtu3ACTCWibYaFAETJQGUcmwh5QaeetagC', 'Евгений', 'Чивапчич', '', '', 'customer', 0, '0000-00-00 00:00:00', '', '0000-00-00 00:00:00'),
('4d70129c-33d0-4379-ab10-24c64a3e30a9', 'admin@mail.com', '$2b$12$Hdm8PQLH3l8RRJzzG0aCGOZEZZpqeX0wnNCtgn2S4l/EG1fjSN8.2', 'Ivan', '', '+79999999999', '', 'admin', 0, '0000-00-00 00:00:00', 'г.Курск, ул.Парковая 14 кв. 76', '2025-09-19 15:57:00'),
('cb7bca23-945c-4b97-b016-1db63e2b4118', 'worker@store.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Петров', '+7 (999) 123-45-67', '', 'sales_assistant', 0, '0000-00-00 00:00:00', '', '0000-00-00 00:00:00'),
('id', 'email', 'password_hash', 'first_name', 'last_name', 'phone', 'avatar_url', '', 0, '0000-00-00 00:00:00', 'address', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Структура таблицы `users_rows`
--

CREATE TABLE IF NOT EXISTS `users_rows` (
  `COL 1` varchar(36) DEFAULT NULL,
  `COL 2` varchar(16) DEFAULT NULL,
  `COL 3` varchar(60) DEFAULT NULL,
  `COL 4` varchar(10) DEFAULT NULL,
  `COL 5` varchar(9) DEFAULT NULL,
  `COL 6` varchar(18) DEFAULT NULL,
  `COL 7` varchar(10) DEFAULT NULL,
  `COL 8` varchar(15) DEFAULT NULL,
  `COL 9` varchar(9) DEFAULT NULL,
  `COL 10` varchar(29) DEFAULT NULL,
  `COL 11` varchar(30) DEFAULT NULL,
  `COL 12` varchar(24) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users_rows`
--

INSERT INTO `users_rows` (`COL 1`, `COL 2`, `COL 3`, `COL 4`, `COL 5`, `COL 6`, `COL 7`, `COL 8`, `COL 9`, `COL 10`, `COL 11`, `COL 12`) VALUES
('id', 'email', 'password_hash', 'first_name', 'last_name', 'phone', 'avatar_url', 'role', 'is_active', 'created_at', 'address', 'updated_at'),
('120c29dc-5d2f-4157-91d3-89802d0aec44', 'user@mail.com', '$2b$12$tqbZ3KBffGqyb3lZURcAtu3ACTCWibYaFAETJQGUcmwh5QaeetagC', 'Евгений', 'Чивапчич', '', '', 'customer', 'true', '2025-09-09 22:55:48.572246+00', '', ''),
('4d70129c-33d0-4379-ab10-24c64a3e30a9', 'admin@mail.com', '$2b$12$Hdm8PQLH3l8RRJzzG0aCGOZEZZpqeX0wnNCtgn2S4l/EG1fjSN8.2', 'Ivan', '', '+79999999999', '', 'admin', 'true', '2025-09-09 21:03:37.332326+00', 'г.Курск, ул.Парковая 14 кв. 76', '2025-09-19T18:57:00.468Z'),
('cb7bca23-945c-4b97-b016-1db63e2b4118', 'worker@store.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Петров', '+7 (999) 123-45-67', '', 'sales_assistant', 'true', '2025-09-09 20:52:16.251775+00', '', '');

-- --------------------------------------------------------

--
-- Структура таблицы `user_cart`
--

CREATE TABLE IF NOT EXISTS `user_cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_user_cart_user_id` (`user_id`)
) ;

-- --------------------------------------------------------

--
-- Структура таблицы `user_wishlist`
--

CREATE TABLE IF NOT EXISTS `user_wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_wishlist` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_user_wishlist_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`);

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ограничения внешнего ключа таблицы `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_slug`) REFERENCES `categories` (`slug`);

--
-- Ограничения внешнего ключа таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_cart`
--
ALTER TABLE `user_cart`
  ADD CONSTRAINT `user_cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_wishlist`
--
ALTER TABLE `user_wishlist`
  ADD CONSTRAINT `user_wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
