-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Фев 06 2026 г., 15:32
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `product_count`, `is_active`, `created_at`, `parent_id`) VALUES
(1, 'Смартфоны', 'smartphones', 'Смартфоны, кнопочные телефоны и аксессуары', '/images/Categories/Smartphones.jpg', 19, 1, '2025-09-09 17:25:35', NULL),
(2, 'Ноутбуки', 'laptops', 'Ноутбуки, ультрабуки и игровые устройства', '/images/Categories/Nootebook.png', 12, 1, '2025-09-09 17:25:35', NULL),
(3, 'Телевизоры', 'tvs', 'Телевизоры, мониторы и медиатехника', '/images/Categories/Tv.jpg', 11, 1, '2025-09-09 17:25:35', NULL),
(4, 'Наушники', 'headphones', 'Наушники, гарнитуры и аудиотехника', '/images/Categories/Headphones.jpg', 11, 1, '2025-09-09 17:25:35', NULL),
(5, 'Фототехника', 'photo', 'Фотоаппараты, объективы и аксессуары', '/images/Categories/Photo.jpg', 10, 1, '2025-09-09 17:25:35', NULL),
(6, 'Игровые консоли', 'gaming', 'Игровые приставки, игры и аксессуары', '/images/Categories/GamingConsole.jpg', 10, 1, '2025-09-09 17:25:35', NULL),
(7, 'Бытовая техника', 'appliances', 'Холодильники, стиральные машины и техника для дома', '/images/Categories/Bit.jpeg', 10, 1, '2025-09-09 17:25:35', NULL),
(8, 'Умный дом', 'smarthouse', 'Принадлежности для умного дома', '/images/Categories/SmartHome.png', 10, 1, '2025-09-13 20:18:45', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `category_filters`
--

CREATE TABLE IF NOT EXISTS `category_filters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `filter_key` varchar(100) NOT NULL,
  `filter_type` enum('price','brand','specification','rating','availability','checkbox','switch','select') NOT NULL,
  `filter_config` json DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_filter` (`category_id`,`filter_key`),
  KEY `idx_category_filters_category_id` (`category_id`),
  KEY `idx_category_filters_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `category_filters`
--

INSERT INTO `category_filters` (`id`, `category_id`, `filter_key`, `filter_type`, `filter_config`, `display_name`, `display_order`, `is_active`, `created_at`) VALUES
(1, 1, 'price', 'price', '{\"presets\": [[0, 10000], [10001, 30000], [30001, 70000], [70001, 150000], [150001, 500000]], \"currency\": \"₽\", \"showCurrency\": true}', 'Цена', 10, 1, '2026-01-26 21:01:29'),
(2, 1, 'availability', 'switch', '{\"label\": \"Только в наличии\", \"defaultValue\": true}', 'Наличие', 20, 1, '2026-01-26 21:01:29'),
(3, 1, 'brand', 'brand', '{\"maxVisible\": 5, \"showSearch\": true, \"sortAlphabetical\": true}', 'Бренд', 30, 1, '2026-01-26 21:01:29'),
(4, 1, 'memory', 'specification', '{\"keys\": [\"storage\", \"ram\"], \"groupTitle\": \"Память\", \"showSearch\": false, \"collapsible\": true}', 'Память', 40, 1, '2026-01-26 21:01:29'),
(5, 1, 'os', 'specification', '{\"keys\": [\"os\"], \"groupTitle\": \"Операционная система\", \"showSearch\": false, \"collapsible\": true}', 'Операционная система', 50, 1, '2026-01-26 21:01:29'),
(6, 1, 'model', 'specification', '{\"keys\": [\"model\", \"processor\"], \"groupTitle\": \"Модель\", \"showSearch\": true, \"collapsible\": true, \"showAllButton\": true}', 'Модель', 60, 1, '2026-01-26 21:01:29'),
(7, 1, 'release_year', 'specification', '{\"keys\": [\"release_year\"], \"groupTitle\": \"Год релиза\", \"showSearch\": false, \"collapsible\": true}', 'Год релиза', 70, 1, '2026-01-26 21:01:29'),
(8, 1, 'battery', 'specification', '{\"keys\": [\"battery_capacity_bucket\"], \"groupTitle\": \"Емкость аккумулятора\", \"showSearch\": false, \"collapsible\": true}', 'Емкость аккумулятора', 80, 1, '2026-01-26 21:01:29'),
(9, 1, 'display', 'specification', '{\"keys\": [\"screen_size_range\", \"refresh_rate\", \"display\", \"resolution_class\"], \"groupTitle\": \"Экран\", \"showSearch\": false, \"collapsible\": true}', 'Экран', 90, 1, '2026-01-26 21:01:29'),
(10, 1, 'connectivity', 'specification', '{\"keys\": [\"nfc\", \"supports_5g\"], \"groupTitle\": \"Связь\", \"showSearch\": false, \"collapsible\": true}', 'Связь', 100, 1, '2026-01-26 21:01:29'),
(11, 1, 'processor', 'specification', '{\"keys\": [\"processor_manufacturer\", \"cpu_cores\"], \"groupTitle\": \"Процессор\", \"showSearch\": false, \"collapsible\": true}', 'Процессор', 110, 1, '2026-01-26 21:01:29'),
(12, 1, 'rating', 'checkbox', '{\"label\": \"Рейтинг 4 и выше\", \"value\": 4}', 'Рейтинг', 120, 1, '2026-01-26 21:01:29'),
(13, 1, 'has_reviews', 'checkbox', '{\"label\": \"Есть отзывы\"}', 'Отзывы', 130, 1, '2026-01-26 21:01:29'),
(14, 1, 'new_models', 'checkbox', '{\"label\": \"Новые модели\"}', 'Новые модели', 140, 1, '2026-01-26 21:01:29'),
(15, 2, 'price', 'price', '{\"presets\": [[0, 30000], [30001, 70000], [70001, 150000], [150001, 300000], [300001, 500000]], \"currency\": \"₽\", \"showCurrency\": true}', 'Цена', 10, 1, '2026-01-26 21:01:29'),
(16, 2, 'brand', 'brand', '{\"maxVisible\": 5, \"showSearch\": true, \"sortAlphabetical\": true}', 'Бренд', 20, 1, '2026-01-26 21:01:29'),
(17, 2, 'processor_type', 'specification', '{\"keys\": [\"processor\"], \"groupTitle\": \"Процессор\", \"showSearch\": true, \"collapsible\": true}', 'Процессор', 30, 1, '2026-01-26 21:01:29'),
(18, 2, 'ram', 'specification', '{\"keys\": [\"ram\"], \"groupTitle\": \"Оперативная память\", \"showSearch\": false, \"collapsible\": true}', 'Оперативная память', 40, 1, '2026-01-26 21:01:29'),
(19, 2, 'storage', 'specification', '{\"keys\": [\"storage\"], \"groupTitle\": \"Накопитель\", \"showSearch\": false, \"collapsible\": true}', 'Накопитель', 50, 1, '2026-01-26 21:01:29'),
(20, 2, 'graphics', 'specification', '{\"keys\": [\"graphics\"], \"groupTitle\": \"Видеокарта\", \"showSearch\": true, \"collapsible\": true}', 'Видеокарта', 60, 1, '2026-01-26 21:01:29'),
(21, 2, 'screen_size', 'specification', '{\"keys\": [\"screen_size_range\"], \"groupTitle\": \"Диагональ экрана\", \"showSearch\": false, \"collapsible\": true}', 'Диагональ экрана', 70, 1, '2026-01-26 21:01:29'),
(22, 4, 'price', 'price', '{\"presets\": [[0, 5000], [5001, 15000], [15001, 30000], [30001, 50000], [50001, 200000]], \"currency\": \"₽\", \"showCurrency\": true}', 'Цена', 10, 1, '2026-01-26 21:01:29'),
(23, 4, 'brand', 'brand', '{\"maxVisible\": 5, \"showSearch\": true, \"sortAlphabetical\": true}', 'Бренд', 20, 1, '2026-01-26 21:01:29'),
(24, 4, 'type', 'specification', '{\"keys\": [\"type\"], \"groupTitle\": \"Тип\", \"showSearch\": false, \"collapsible\": true}', 'Тип', 30, 1, '2026-01-26 21:01:29'),
(25, 4, 'wireless', 'specification', '{\"keys\": [\"wireless\"], \"groupTitle\": \"Тип подключения\", \"showSearch\": false, \"collapsible\": true}', 'Тип подключения', 40, 1, '2026-01-26 21:01:29'),
(26, 4, 'noise_canceling', 'specification', '{\"keys\": [\"noise_canceling\"], \"groupTitle\": \"Шумоподавление\", \"showSearch\": false, \"collapsible\": true}', 'Шумоподавление', 50, 1, '2026-01-26 21:01:29');

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
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'card',
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
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`),
  KEY `orders_ibfk_3` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `customer_email`, `shipping_address`, `total_amount`, `payment_method`, `status`, `store_id`, `employee_id`, `user_id`, `created_at`, `updated_at`) VALUES
(87, 'ORDER-1768132814-416', 'Ivan Ivan', '89510880328', 'admin@mail.com', 'Парковая', 139980.00, 'card', 'cancelled', NULL, NULL, '4d70129c-33d0-4379-ab10-24c64a3e30a9', '2026-01-11 12:00:14', '2026-01-11 18:13:25'),
(88, 'ORDER-1768153742-668', 'Ivan Ivan', '89510880328', 'admin@mail.com', 'Парковая', 30980.00, 'card', 'cancelled', NULL, NULL, '4d70129c-33d0-4379-ab10-24c64a3e30a9', '2026-01-11 17:49:02', '2026-01-11 18:13:12'),
(89, 'ORDER-1768153942-565', 'Ivan Ivan', '89510880328', 'admin@mail.com', 'Парковая', 6990.00, 'card', 'cancelled', NULL, NULL, '4d70129c-33d0-4379-ab10-24c64a3e30a9', '2026-01-11 17:52:22', '2026-01-11 18:06:53');

-- --------------------------------------------------------

--
-- Структура таблицы `order_items`
--

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
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

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `price`, `name`, `image`, `created_at`) VALUES
(58, 87, 2747, 'Игровой ноутбук Acer Nitro 5', 2, 69990.00, 'Игровой ноутбук Acer Nitro 5', NULL, '2026-01-11 12:00:14'),
(59, 88, 2731, 'Наушники Apple AirPods Pro 2', 1, 23990.00, 'Наушники Apple AirPods Pro 2', NULL, '2026-01-11 17:49:02'),
(60, 88, 2738, 'Игровые наушники HyperX Cloud Alpha', 1, 6990.00, 'Игровые наушники HyperX Cloud Alpha', NULL, '2026-01-11 17:49:02'),
(61, 89, 2738, 'Игровые наушники HyperX Cloud Alpha', 1, 6990.00, 'Игровые наушники HyperX Cloud Alpha', NULL, '2026-01-11 17:52:22');

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
) ENGINE=InnoDB AUTO_INCREMENT=2781 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `price`, `old_price`, `description`, `category_slug`, `brand`, `rating`, `reviews_count`, `is_new`, `discount`, `stock`, `specifications`, `is_active`, `created_at`, `updated_at`, `image_url`) VALUES
(2, 'Смартфон Samsung Galaxy S23 Ultra', 'samsung-galaxy-s23-ultra', 89900.00, 99900.00, 'Samsung Galaxy S23 Ultra — флагман для тех, кто требует максимальной камеры и функционала. Большой Dynamic AMOLED 2X дисплей 6.8\" 120 Гц, мощная платформа Snapdragon 8 Gen 2 и аккумулятор 5000 мАч обеспечивают производительность и длительную автономность. Встроенный S-Pen, продвинутая камера 200 Мп и премиальные материалы корпуса делают устройство отличным выбором для работы и творчества.', 'smartphones', 'Samsung', 4.50, 256, 0, 10, 18, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano + eSIM)\", \"wifi\": \"Wi-Fi 6E\", \"color\": \"Phantom Black\", \"video\": \"8K@30fps, 4K@60fps\", \"camera\": \"200 Мп (основная) + 10 Мп (перископ 10x) + 10 Мп (теле 3x) + 12 Мп (ультраширокая)\", \"weight\": \"234 г\", \"battery\": \"5000 мАч\", \"display\": \"Dynamic AMOLED 2X\", \"network\": \"5G, LTE, Wi-Fi 6E\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass Victus 2 + алюминий\", \"security\": \"Ультразвуковой сканер отпечатков\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (One UI 5.1)\", \"resolution\": \"3088x1440\", \"waterproof\": \"IP68\", \"fast_charge\": \"45W\", \"screen_size\": \"6.8\\\"\", \"front_camera\": \"12 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"15W\"}', 1, '2025-06-28 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Samsung/Samsung Galaxy S23 Ultra.png\"]'),
(3, 'Смартфон Xiaomi Redmi Note 13', 'xiaomi-redmi-note-13', 24990.00, 29990.00, 'Redmi Note 13 сочетает современный AMOLED-дисплей и сбалансированную «железную» платформу, предлагая отличное соотношение цены и качества. Камера 64 Мп и ёмкая батарея 5000 мАч с быстрой зарядкой 33W подойдут для повседневной съёмки и долгой работы без подзарядки. Компактный и лёгкий корпус с защитой от брызг делает устройство удобным в повседневном использовании.', 'smartphones', 'Xiaomi', 4.20, 189, 0, 17, 32, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"color\": \"Синий\", \"video\": \"4K@30fps\", \"camera\": \"64 Мп (основная) + 8 Мп (ультраширокая) + 2 Мп (макро)\", \"weight\": \"181 г\", \"battery\": \"5000 мАч\", \"display\": \"AMOLED\", \"network\": \"5G, LTE\", \"storage\": \"128 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер отпечатков в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Dimensity 920\", \"os_version\": \"13 (MIUI 14)\", \"resolution\": \"2400x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"33W\", \"screen_size\": \"6.43\\\"\", \"front_camera\": \"16 Мп\", \"refresh_rate\": \"90 Гц\", \"wireless_charge\": false}', 1, '2024-12-15 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Xiaomi/Xiaomi Redmi Note 13.png\"]'),
(4, 'Смартфон Google Pixel 8 Pro', 'google-pixel-8-pro', 89990.00, 99990.00, 'Google Pixel 8 Pro — смартфон с упором на вычислительную фотографию и чистый Android. Tensor G3 обеспечивает адаптивные функции ИИ, а комбинация камер даёт отличные снимки при любой освещённости. Долгосрочные обновления системы и удобный интерфейс делают устройство привлекательным для пользователей, которые ценят софт и качество фото.', 'smartphones', 'Google', 4.70, 89, 0, 10, 12, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"1 SIM (eSIM)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Snow\", \"video\": \"4K@60fps\", \"camera\": \"50 Мп (широкая) + 48 Мп (ультраширокая) + 48 Мп (теле)\", \"weight\": \"213 г\", \"battery\": \"5050 мАч\", \"display\": \"LTPO OLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"128 ГБ\", \"material\": \"Gorilla Glass + алюминий\", \"security\": \"Сканер в экране + Face Unlock\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Google Tensor G3\", \"os_version\": \"14\", \"resolution\": \"2992x1344\", \"waterproof\": \"IP68\", \"ai_features\": \"Magic Eraser, улучшенная ИИ-обработка фото\", \"fast_charge\": \"30W\", \"screen_size\": \"6.7\\\"\", \"front_camera\": \"10.8 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"23W\"}', 1, '2025-07-05 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Google/Google_Pixel_8_Pro.png\"]'),
(5, 'Смартфон OnePlus 12', 'oneplus-12', 69990.00, 79990.00, 'OnePlus 12 — флагман для тех, кто ценит скорость и отзывчивость. Большой LTPO AMOLED-экран 6.82\" с высокой чёткостью и частотой обновления в 120 Гц, а также топовый чип Snapdragon 8 Gen 3 обеспечивают отличная производительность в играх и многозадачности. Молниеносная зарядка 100W и поддержка беспроводной зарядки делают устройство удобным в повседневном использовании.', 'smartphones', 'OnePlus', 4.60, 156, 0, 12, 20, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"16 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Silver\", \"video\": \"8K@24fps, 4K@120fps\", \"camera\": \"50 Мп (основная) + 48 Мп (ультраширокая) + 64 Мп (теле)\", \"weight\": \"220 г\", \"battery\": \"5400 мАч\", \"display\": \"LTPO AMOLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass Victus 2 + алюминиевая рамка\", \"security\": \"Сканер в экране, Alert Slider\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.4\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 3\", \"os_version\": \"14 (OxygenOS 14)\", \"resolution\": \"3168x1440\", \"waterproof\": \"IP65\", \"fast_charge\": \"100W\", \"screen_size\": \"6.82\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"50W\"}', 1, '2024-11-18 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Oneplus/OnePlus 12.png\"]'),
(6, 'Смартфон Huawei P60 Pro', 'huawei-p60-pro', 84990.00, 94990.00, 'Huawei P60 Pro — премиальный смартфон с акцентом на оптику и съёмку. Мощная основная система камер, большой OLED-экран и крупный аккумулятор позволяют получать качественные кадры и долгую автономность. Устройство на HarmonyOS ориентировано на пользователей, которым важны камера и дизайн; обратите внимание, что модель может иметь особенности по поддержке сетей и сервисов в зависимости от региона.', 'smartphones', 'Huawei', 4.50, 78, 0, 11, 8, '{\"os\": \"HarmonyOS\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"Rococo Pearl\", \"video\": \"4K@60fps\", \"camera\": \"48 Мп (основная) + 48 Мп (перископ/теле) + 13 Мп (ультраширокая)\", \"weight\": \"200 г\", \"battery\": \"4815 мАч\", \"display\": \"OLED\", \"network\": \"4G/LTE (варианты в зависимости от региона)\", \"storage\": \"256 ГБ\", \"material\": \"Стекло + металлическая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8+ Gen 1\", \"os_version\": \"3.1\", \"resolution\": \"2700x1228\", \"waterproof\": \"IP68\", \"fast_charge\": \"88W\", \"screen_size\": \"6.67\\\"\", \"front_camera\": \"13 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"50W\"}', 1, '2025-02-03 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Huawei/Huawei P60 Pro.png\"]'),
(10, 'Смартфон Nothing Phone (2)', 'nothing-phone-2', 54990.00, 64990.00, 'Nothing Phone (2) выделяется необычным дизайном и фирменным световым интерфейсом Glyph. Устройство сочетает прозрачную заднюю панель с информативной LED-подсветкой, мощную платформу и хороший набор камер для мобильной съёмки. Подойдёт тем, кто хочет заметный внешний вид и современный набор функций по разумной цене.', 'smartphones', 'Nothing', 4.20, 187, 0, 15, 22, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"White\", \"video\": \"4K@60fps\", \"camera\": \"50 Мп (основная) + 50 Мп (ультраширокая)\", \"weight\": \"201 г\", \"battery\": \"4700 мАч\", \"display\": \"OLED\", \"network\": \"5G, LTE\", \"storage\": \"256 ГБ\", \"material\": \"Gorilla Glass + алюминий\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8+ Gen 1\", \"os_version\": \"13 (Nothing OS 2.0)\", \"resolution\": \"2412x1080\", \"waterproof\": \"IP54\", \"fast_charge\": \"45W\", \"screen_size\": \"6.7\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"glyph_interface\": \"Светодиодная подсветка (Glyph)\", \"wireless_charge\": \"15W\"}', 1, '2025-01-07 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Nothing/Nothing Phone 2.png\"]'),
(12, 'Смартфон Honor Magic 5', 'honor-magic-5', 59990.00, 69990.00, 'Honor Magic 5 — универсальный флагман с мощной аппаратной частью и большим экраном, ориентирован на творческую работу и контент. Камерная система обеспечивает детализированные снимки, а ёмкий аккумулятор и быстрая зарядка дают уверенную автономность. Приятный дизайн и хороший набор коммуникаций делают телефон удобным для повседневного использования.', 'smartphones', 'Honor', 4.30, 116, 0, 14, 19, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"12 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"color\": \"Blue\", \"video\": \"4K@60fps\", \"camera\": \"54 Мп (широкая) + 50 Мп (ультраширокая) + 32 Мп (теле)\", \"weight\": \"191 г\", \"battery\": \"5100 мАч\", \"display\": \"OLED\", \"network\": \"5G, LTE\", \"storage\": \"256 ГБ\", \"material\": \"Стекло + алюминиевая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (MagicOS 7.1)\", \"resolution\": \"2688x1224\", \"waterproof\": \"IP54\", \"fast_charge\": \"66W\", \"screen_size\": \"6.73\\\"\", \"front_camera\": \"12 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 1, '2025-01-07 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Honor/honor_magic5.jpg\"]'),
(13, 'Смартфон ASUS ROG Phone 7', 'asus-rog-phone-7', 89990.00, 99990.00, 'ASUS ROG Phone 7 — специализированный игровой смартфон с акцентом на производительность и охлаждение. Массивная батарея 6000 мАч, частота экрана до 165 Гц и поддержка активного охлаждения дают длительные игровые сессии без троттлинга. Дополнительные игровые фичи (AirTrigger, оптимизация ПО) делают устройство лучшим выбором для мобильных геймеров.', 'smartphones', 'ASUS', 4.80, 201, 0, 10, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"16 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 7\", \"color\": \"Black\", \"video\": \"8K@24fps\", \"camera\": \"50 Мп (основная) + 13 Мп (ультраширокая) + 5 Мп (макро)\", \"weight\": \"239 г\", \"battery\": \"6000 мАч\", \"display\": \"AMOLED\", \"network\": \"5G, LTE, Wi-Fi 7\", \"storage\": \"512 ГБ\", \"material\": \"Стекло + металлическая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 8 Gen 2\", \"os_version\": \"13 (ROG UI)\", \"resolution\": \"2448x1080\", \"waterproof\": \"IP54\", \"fast_charge\": \"65W\", \"screen_size\": \"6.78\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"165 Гц\", \"gaming_features\": \"Активное охлаждение, AirTrigger\", \"wireless_charge\": false}', 1, '2025-03-31 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/ASUS/asus_rogphone7.jpg\"]'),
(16, 'Смартфон Tecno Camon 20', 'tecno-camon-20', 19990.00, 24990.00, 'Tecno Camon 20 — бюджетный смартфон с акцентом на съёмку и автономность. Большой экран 6.67\" и аккумулятор 5000 мАч обеспечивают комфортный просмотр видео и долгую работу без подзарядки. Для своей цены модель предлагает приличный набор камер и достаточный объём памяти.', 'smartphones', 'Tecno', 3.90, 267, 0, 20, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"color\": \"Blue\", \"video\": \"1440p@30fps\", \"camera\": \"64 Мп (основная) + 2 Мп (макро) + 2 Мп (глубина)\", \"weight\": \"190 г\", \"battery\": \"5000 мАч\", \"display\": \"IPS LCD\", \"network\": \"4G LTE\", \"storage\": \"256 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер в боковой кнопке\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.0\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Helio G99\", \"os_version\": \"13 (HIOS)\", \"resolution\": \"2460x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"33W\", \"screen_size\": \"6.67\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 1, '2025-05-20 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Techno/techno_camon20.jpg\"]'),
(17, 'Смартфон Infinix Note 30', 'infinix-note-30', 17990.00, 22990.00, 'Infinix Note 30 предлагает большой AMOLED-экран и ёмкую батарею в доступном ценовом сегменте. Камера 108 Мп обеспечивает высокую детальность при хорошем освещении, а фирменные аудиотехнологии улучшают звучание мультимедиа. Устройство подойдёт пользователям, которым нужен большой экран и долгий экран-время работы.', 'smartphones', 'Infinix', 3.80, 189, 0, 22, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 5\", \"audio\": \"Стереодинамики JBL\", \"color\": \"Black\", \"video\": \"1440p@30fps\", \"camera\": \"108 Мп (основная) + 2 Мп (макро) + 2 Мп (глубина)\", \"weight\": \"195 г\", \"battery\": \"5000 мАч\", \"display\": \"AMOLED\", \"network\": \"4G LTE\", \"storage\": \"256 ГБ\", \"material\": \"Пластик\", \"security\": \"Сканер в экране\", \"warranty\": \"12 месяцев\", \"bluetooth\": \"5.2\", \"connector\": \"USB-C\", \"processor\": \"MediaTek Helio G99\", \"os_version\": \"13 (XOS)\", \"resolution\": \"2400x1080\", \"waterproof\": \"IP53\", \"fast_charge\": \"45W\", \"screen_size\": \"6.78\\\"\", \"front_camera\": \"32 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": false}', 1, '2025-05-17 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Infinix/infinix_note30.png\"]'),
(19, 'Смартфон LG Velvet 2', 'lg-velvet-2', 39990.00, 49990.00, 'LG Velvet 2 сочетает утончённый дизайн и качественный звук, подходящий для мультимедиа и повседневных задач. Большой P-OLED экран и сбалансированный процессор дают приятное визуальное впечатление и плавную работу интерфейса. Устройство ориентировано на пользователей, которым важны комфорт просмотра и качественный аудио-опыт.', 'smartphones', 'LG', 4.20, 73, 0, 20, 0, '{\"os\": \"Android\", \"gps\": true, \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"2 SIM (nano)\", \"wifi\": \"Wi-Fi 6\", \"audio\": \"Стереодинамики, 3.5 mm jack\", \"color\": \"Aurora Gray\", \"video\": \"4K@30fps\", \"camera\": \"64 Мп (основная) + 8 Мп (ультраширокая) + 5 Мп (глубина)\", \"weight\": \"180 г\", \"battery\": \"4300 мАч\", \"display\": \"P-OLED\", \"network\": \"5G, LTE\", \"storage\": \"128 ГБ\", \"material\": \"Стекло + пластиковая рамка\", \"security\": \"Сканер в экране\", \"warranty\": \"24 месяца\", \"bluetooth\": \"5.1\", \"connector\": \"USB-C\", \"processor\": \"Qualcomm Snapdragon 778G\", \"os_version\": \"12\", \"resolution\": \"2460x1080\", \"waterproof\": \"IP68\", \"fast_charge\": \"25W\", \"screen_size\": \"6.8\\\"\", \"front_camera\": \"16 Мп\", \"refresh_rate\": \"120 Гц\", \"wireless_charge\": \"10W\"}', 1, '2024-12-06 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/LG/lg_velvet2.png\"]'),
(24, 'Ноутбук Apple MacBook Pro 16\"', 'apple-macbook-pro-16', 199990.00, 219990.00, 'MacBook Pro 16\" — профессиональный ноутбук для творческих задач и тяжёлых рабочих нагрузок. M2 Pro обеспечивает серьёзную производительность в рендеринге, монтаже и разработке, а экран Liquid Retina XDR даёт точную цветопередачу. Богатый набор портов и длительное время автономной работы делают модель отличным выбором для профессионалов.', 'laptops', 'Apple', 4.80, 89, 0, 9, 5, '{\"os\": \"macOS\", \"ram\": \"16 ГБ\", \"audio\": \"6-динамиковая система, пространственный звук\", \"color\": \"Space Gray\", \"ports\": \"3x Thunderbolt 4, HDMI, SDXC, MagSafe 3\", \"webcam\": \"1080p FaceTime HD\", \"weight\": \"2.15 кг\", \"battery\": \"100 Вт·ч\", \"display\": \"Liquid Retina XDR\", \"storage\": \"512 ГБ SSD\", \"graphics\": \"19-core GPU\", \"keyboard\": \"Backlit Magic Keyboard\", \"security\": \"Touch ID\", \"trackpad\": \"Force Touch\", \"warranty\": \"12 месяцев\", \"wireless\": \"Wi-Fi 6E, Bluetooth 5.3\", \"processor\": \"Apple M2 Pro (12-core)\", \"os_version\": \"Ventura\", \"resolution\": \"3456x2234\", \"screen_size\": \"16.2\\\"\"}', 1, '2025-09-24 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Laptops/Apple/mackbook_pro16.jpg\"]'),
(25, 'Ноутбук ASUS ROG Strix', 'asus-rog-strix', 129990.00, 149990.00, 'ASUS ROG Strix — мощный игровой ноутбук с акцентом на производительность и охлаждение. Конфигурация с Intel Core i9 и RTX 4080 позволяет запускать современные игры на высоких настройках, а продвинутая система охлаждения сохраняет стабильность при длительных сессиях. Подходит для геймеров и контент-креаторов, которым нужна мобильная рабочая станция.', 'laptops', 'ASUS', 4.60, 67, 0, 13, 0, '{\"os\": \"Windows 11\", \"ram\": \"32 ГБ DDR5\", \"audio\": \"2x 2W speakers, Dolby Atmos\", \"color\": \"Black\", \"ports\": \"2x USB-C (Thunderbolt 4), 3x USB-A, HDMI 2.1, RJ45\", \"webcam\": \"720p\", \"weight\": \"3.0 кг\", \"battery\": \"90 Вт·ч\", \"cooling\": \"2 вентилятора, 5 теплотрубок\", \"display\": \"IPS\", \"storage\": \"1 ТБ SSD NVMe\", \"graphics\": \"NVIDIA GeForce RTX 4080 12GB\", \"keyboard\": \"RGB per-key\", \"warranty\": \"24 месяца\", \"wireless\": \"Wi-Fi 6E, Bluetooth 5.2\", \"processor\": \"Intel Core i9-13980HX\", \"os_version\": \"Pro\", \"resolution\": \"2560x1440\", \"screen_size\": \"17.3\\\"\", \"refresh_rate\": \"240 Гц\"}', 1, '2025-01-27 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Laptops/ASUS/asus_rogstrix.png\"]'),
(26, 'Телевизор Samsung QLED 65\"', 'samsung-qled-65', 89990.00, 109990.00, 'Samsung QLED 65\" — 4K телевизор с насыщенной цветопередачей и поддержкой HDR10+. Подойдёт как для домашнего кинотеатра, так и для игр: низкая задержка, режим Game Mode и HDMI 2.1. Умные функции на базе Tizen и голосовые ассистенты делают управление удобным и гибким.', 'tvs', 'Samsung', 4.70, 145, 0, 18, 12, '{\"os\": \"Tizen\", \"hdr\": \"HDR10+, HLG\", \"usb\": \"2x USB\", \"hdmi\": \"4x HDMI 2.1\", \"wifi\": \"Wi-Fi 5\", \"sound\": \"40W, 2.1ch, Dolby Atmos\", \"weight\": \"23.5 кг\", \"display\": \"QLED\", \"diagonal\": \"65\\\"\", \"smart_tv\": true, \"warranty\": \"24 месяца\", \"bluetooth\": \"4.2\", \"resolution\": \"3840x2160 (4K)\", \"wall_mount\": \"VESA 400x300\", \"energy_class\": \"A\", \"refresh_rate\": \"120 Гц\", \"voice_control\": \"Bixby, Alexa, Google Assistant\", \"gaming_features\": \"Game Mode, FreeSync Premium\"}', 1, '2025-05-18 17:18:00', '2025-10-19 12:24:15', '[\"/images/products/TVs/Samsung/samsung_qled65.jpg\"]'),
(27, 'Наушники Sony WH-1000XM5', 'sony-wh-1000xm5', 29990.00, 34990.00, 'Sony WH-1000XM5 — флагманские беспроводные наушники с выдающимся активным шумоподавлением и отличным звуком. До 30 часов работы от батареи, удобная посадка и сенсорное управление делают их комфортными для длительного использования. Поддержка LDAC и интеграция с голосовыми ассистентами обеспечивают высокое качество прослушивания и удобство управления.', 'headphones', 'Sony', 4.90, 312, 0, 14, 30, '{\"case\": \"Чехол для переноски\", \"type\": \"Накладные беспроводные\", \"color\": \"Black\", \"weight\": \"250 г\", \"battery\": \"До 30 часов (ANC включено)\", \"charging\": \"Быстрая зарядка: 3 мин = 3 часа\", \"features\": \"Сенсорное управление, голосовые помощники\", \"foldable\": \"Да\", \"warranty\": \"24 месяца\", \"microphones\": \"Множество микрофонов для звонков и ANC\", \"audio_codecs\": \"LDAC, AAC, SBC\", \"connectivity\": \"Bluetooth 5.2\", \"noise_canceling\": \"Адаптивное активное шумоподавление\", \"water_resistance\": \"IPX4 (защита от брызг)\"}', 1, '2024-11-12 17:18:00', '2025-10-19 12:24:15', '[\"/images/products/Headphones/Sony/sony_wh-1000xm5.jpeg\"]'),
(32, 'Смартфон Apple iPhone 16 128GB Чёрный', 'apple-iphone-16-128gb-black', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.80, 45, 1, 6, 15, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Черный\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-05-29 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (4).jpg\"]'),
(33, 'Смартфон Apple iPhone 16 256GB Чёрный', 'apple-iphone-16-256gb-black', 89990.00, 94990.00, 'Apple iPhone 16 в классическом черном цвете. Строгий и элегантный дизайн, который подчеркивает статусность устройства. 8 ГБ оперативной памяти обеспечивают плавную работу даже самых требовательных приложений.', 'smartphones', 'Apple', 4.80, 32, 1, 5, 12, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Черный\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-08-22 17:18:00', '2025-10-19 12:28:02', '[\"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 black/iphone_16_black (4).jpg\"]'),
(34, 'Смартфон Apple iPhone 16 128GB Белый', 'apple-iphone-16-128gb-white', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.70, 38, 1, 6, 18, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Белый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-03-09 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (4).jpg\"]'),
(35, 'Смартфон Apple iPhone 16 256GB Белый', 'apple-iphone-16-256gb-white', 89990.00, 94990.00, 'Apple iPhone 16 в белом цвете. Чистый и свежий дизайн, который символизирует современность и технологичность. 8 ГБ оперативной памяти для многозадачности и высокой производительности.', 'smartphones', 'Apple', 4.75, 28, 1, 5, 14, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Белый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-03-18 17:18:00', '2025-10-19 12:24:14', '[\"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 white/iphone_16_belyy (4).jpg\"]'),
(36, 'Смартфон Apple iPhone 16 128GB Розовый', 'apple-iphone-16-128gb-pink', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.65, 42, 1, 6, 10, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Розовый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-09-13 17:18:00', '2025-11-12 11:08:01', '[\"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (4).jpg\", \"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink.jpg\"]'),
(37, 'Смартфон Apple iPhone 16 256GB Розовый', 'apple-iphone-16-256gb-pink', 89990.00, 94990.00, 'Apple iPhone 16 в нежном розовом цвете. Стильный и современный смартфон для ярких личностей. 8 ГБ оперативной памяти обеспечивают быстродействие системы.', 'smartphones', 'Apple', 4.68, 25, 1, 5, 7, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Розовый\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-01-27 17:18:00', '2025-11-12 11:08:17', '[\"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 pink/iphone_16_pink (4).jpg\"]'),
(38, 'Смартфон Apple iPhone 16 128GB Синий', 'apple-iphone-16-128gb-blue', 79990.00, 84990.00, 'Apple iPhone 16 — современный флагманский смартфон с улучшенной камерой и плавной работой. Оснащён процессором A18, ярким Super Retina XDR OLED-дисплеем 60 Гц и продвинутой системой камер для качественной съёмки в любых условиях. Надёжная сборка, защита IP68 и поддержка MagSafe делают устройство удобным и долговечным.', 'smartphones', 'Apple', 4.72, 35, 1, 6, 12, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Синий\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"128 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-06-21 17:18:00', '2025-11-11 08:06:32', '[\"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (4).jpg\"]'),
(39, 'Смартфон Apple iPhone 16 256GB Синий', 'apple-iphone-16-256gb-blue', 89990.00, 94990.00, 'Apple iPhone 16 в насыщенном синем цвете. Выразительный дизайн с высокой производительностью. 8 ГБ оперативной памяти для комфортной работы и игр.', 'smartphones', 'Apple', 4.75, 22, 1, 5, 9, '{\"os\": \"iOS 18\", \"gps\": \"GPS, ГЛОНАСС, Galileo, QZSS\", \"nfc\": true, \"ram\": \"8 ГБ\", \"sim\": \"Dual SIM (nano-SIM и eSIM)\", \"chip\": \"A18 с 6-ядерным CPU и 5-ядерным GPU\", \"wifi\": \"Wi-Fi 6\", \"zoom\": \"2x оптический, 5x цифровой\", \"color\": \"Синий\", \"inBox\": \"iPhone, кабель USB-C, документация\", \"video\": \"4K@60fps, HDR\", \"camera\": \"48 МП (основная) + 12 МП (ультраширокая)\", \"faceID\": true, \"weight\": \"173 г\", \"battery\": \"3240 мАч\", \"country\": \"Собран в Китае\", \"display\": \"Super Retina XDR OLED\", \"network\": \"5G (sub-6 GHz)\", \"sensors\": \"Face ID, акселерометр, гироскоп, компас, барометр\", \"storage\": \"256 ГБ\", \"alwaysOn\": false, \"aperture\": \"f/1.6 (основная), f/2.4 (ультраширокая)\", \"charging\": \"20W быстрая зарядка\", \"material\": \"Алюминий и стекло\", \"speakers\": \"Стерео\", \"warranty\": \"1 год\", \"bluetooth\": \"5.3\", \"connector\": \"USB-C 2.0\", \"dustproof\": true, \"nightMode\": true, \"processor\": \"A18\", \"brightness\": \"1600 нит (пиковая)\", \"dimensions\": \"146.7 × 71.5 × 7.8 мм\", \"frontVideo\": \"4K@60fps\", \"microphone\": \"3 шумоподавляющих микрофона\", \"protection\": \"Ceramic Shield\", \"resolution\": \"2556 × 1179 пикселей\", \"screenSize\": \"6.1 дюйма\", \"waterproof\": \"IP68 (до 6 метров, 30 минут)\", \"batteryLife\": \"До 20 часов видео\", \"frontCamera\": \"12 МП TrueDepth\", \"refreshRate\": \"60 Гц\", \"neuralEngine\": \"16-ядерный\", \"portraitMode\": true, \"chargingBlock\": \"Не входит в комплект\", \"cinematicMode\": true, \"dualFrequency\": false, \"frontAperture\": \"f/1.9\", \"ultraWideband\": false, \"wirelessCharging\": \"MagSafe 15W, Qi 7.5W\"}', 1, '2025-05-04 17:18:00', '2025-11-11 08:07:17', '[\"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (3).jpg\", \"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (2).jpg\", \"/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (4).jpg\"]'),
(391, 'Холодильник Samsung Bespoke', 'samsung-bespoke-refrigerator', 89990.00, 99990.00, 'Смарт-холодильник с возможностью кастомизации панелей, системой No Frost и Wi-Fi управлением', 'appliances', 'Samsung', 4.70, 156, 1, 10, 15, '{\"type\": \"Двухкамерный\", \"color\": \"Серый\", \"capacity\": \"420 л\", \"no_frost\": true, \"warranty\": \"24 месяца\", \"energy_class\": \"A++\", \"smart_features\": [\"Wi-Fi\", \"Управление через приложение\", \"Голосовое управление\"]}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/samsung_bespoke.jpg\"]'),
(392, 'Стиральная машина LG Inverter Direct Drive', 'lg-inverter-washing-machine', 54990.00, 64990.00, 'Стиральная машина с прямым приводом, технологией Steam и низким уровнем шума', 'appliances', 'LG', 4.80, 234, 0, 15, 22, '{\"capacity\": \"8 кг\", \"features\": [\"Паровая обработка\", \"Прямой привод\", \"Защита от протечек\"], \"max_spin\": \"1400 об/мин\", \"noise_level\": \"52 дБ\", \"energy_class\": \"A+++\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/lg_washing.jpg\"]'),
(393, 'Посудомоечная машина Bosch Serie 6', 'bosch-dishwasher-serie6', 47990.00, 55990.00, 'Встраиваемая посудомоечная машина с зонной мойкой и системой AquaStop', 'appliances', 'Bosch', 4.60, 189, 0, 14, 18, '{\"capacity\": \"14 комплектов\", \"features\": [\"Зонная мойка\", \"AquaStop\", \"Полуинтеграция\"], \"noise_level\": \"44 дБ\", \"energy_class\": \"A++\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/bosch_dishwasher.jpg\"]'),
(394, 'Микроволновая печь Panasonic Genius', 'panasonic-genius-microwave', 21990.00, 25990.00, 'Микроволновая печь с технологией Genius Sensor и функцией гриля', 'appliances', 'Panasonic', 4.40, 98, 1, 15, 30, '{\"power\": \"1000 Вт\", \"capacity\": \"27 л\", \"features\": [\"Гриль\", \"Инверторная технология\", \"Автоматические программы\"]}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/panasonic_microwave.jpg\"]'),
(395, 'Электрическая плита Gorenje', 'gorenje-electric-stove', 42990.00, 49990.00, 'Двухконфорочная электрическая плита со стеклокерамической поверхностью', 'appliances', 'Gorenje', 4.30, 67, 0, 14, 12, '{\"type\": \"Настольная\", \"power\": \"3500 Вт\", \"burners\": \"2\", \"material\": \"Стеклокерамика\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/gorenje_stove.jpg\"]'),
(396, 'Робот-пылесос Xiaomi Robot Vacuum', 'xiaomi-robot-vacuum', 29990.00, 34990.00, 'Умный робот-пылесос с лазерной навигацией и влажной уборкой', 'appliances', 'Xiaomi', 4.50, 345, 1, 14, 25, '{\"type\": \"Робот-пылесос\", \"battery\": \"5200 мАч\", \"features\": [\"Влажная уборка\", \"Картографирование\", \"Управление через приложение\"], \"navigation\": \"Лазерная\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/xiaomi_vacuum.jpg\"]'),
(397, 'Электрический чайник Tefal', 'tefal-electric-kettle', 4590.00, 5490.00, 'Электрический чайник с фильтром от накипи и защитой от перегрева', 'appliances', 'Tefal', 4.20, 456, 0, 16, 50, '{\"power\": \"2200 Вт\", \"capacity\": \"1.7 л\", \"features\": [\"Фильтр от накипи\", \"Защитное отключение\", \"Шкала уровня воды\"], \"material\": \"Нержавеющая сталь\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/tefal_kettle.jpg\"]'),
(398, 'Кофемашина DeLonghi Magnifica', 'delonghi-magnifica-coffee', 39990.00, 47990.00, 'Автоматическая кофемашина с капучинатором и системой автопромывки', 'appliances', 'DeLonghi', 4.70, 178, 1, 17, 8, '{\"type\": \"Автоматическая\", \"capacity\": \"1.8 л\", \"features\": [\"Автокапучинатор\", \"13 степеней помола\", \"Цифровой дисплей\"], \"coffee_types\": [\"Эспрессо\", \"Капучино\", \"Латте\"]}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/delonghi_coffee.jpg\"]'),
(399, 'Вытяжка Krona Kamilla', 'krona-kamilla-hood', 18990.00, 22990.00, 'Купольная вытяжка с LED-подсветкой и сенсорным управлением', 'appliances', 'Krona', 4.30, 89, 0, 17, 14, '{\"type\": \"Купольная\", \"power\": \"350 м³/ч\", \"features\": [\"Сенсорное управление\", \"LED-подсветка\", \"3 скорости работы\"], \"noise_level\": \"55 дБ\"}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/krona_hood.jpg\"]'),
(400, 'Кондиционер Ballu', 'ballu-air-conditioner', 34990.00, 41990.00, 'Сплит-система с инверторным компрессором и Wi-Fi управлением', 'appliances', 'Ballu', 4.40, 123, 1, 17, 9, '{\"area\": \"25 м²\", \"type\": \"Сплит-система\", \"power\": \"9000 BTU\", \"features\": [\"Инверторный компрессор\", \"Wi-Fi управление\", \"Ночной режим\", \"Таймер\"]}', 1, '2026-01-10 14:34:09', NULL, '[\"/images/products/Appliances/ballu_ac.jpg\"]'),
(2721, 'PlayStation 5 Digital Edition', 'playstation-5-digital', 45990.00, 49990.00, 'Игровая консоль Sony PlayStation 5 в цифровой версии', 'gaming', 'Sony', 4.90, 567, 1, 8, 12, '{\"type\": \"Игровая консоль\", \"storage\": \"825 ГБ SSD\", \"features\": [\"Без дисковода\", \"Поддержка Ray Tracing\", \"Tempest 3D Audio\", \"SSD накопитель\"], \"resolution\": \"4K\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/ps5_digital.jpg\"]'),
(2722, 'Xbox Series X', 'xbox-series-x', 49990.00, 54990.00, 'Мощная игровая консоль Microsoft с поддержкой 4K 120fps', 'gaming', 'Microsoft', 4.80, 432, 1, 9, 15, '{\"type\": \"Игровая консоль\", \"storage\": \"1 ТБ SSD\", \"features\": [\"Поддержка 120 FPS\", \"Ray Tracing\", \"Quick Resume\", \"Backward compatibility\"], \"resolution\": \"4K\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/xbox_series_x.jpg\"]'),
(2723, 'Nintendo Switch OLED', 'nintendo-switch-oled', 29990.00, 34990.00, 'Гибридная консоль с OLED-экраном 7 дюймов', 'gaming', 'Nintendo', 4.70, 321, 1, 14, 20, '{\"type\": \"Гибридная консоль\", \"screen\": \"7\\\" OLED\", \"storage\": \"64 ГБ\", \"features\": [\"Портативный режим\", \"Док-станция\", \"Улучшенный звук\", \"Широкий угол обзора\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/switch_oled.jpg\"]'),
(2724, 'PlayStation 5 Standard Edition', 'playstation-5-standard', 54990.00, 59990.00, 'Игровая консоль Sony PlayStation 5 с дисководом Ultra HD Blu-ray', 'gaming', 'Sony', 4.90, 789, 0, 8, 8, '{\"type\": \"Игровая консоль\", \"storage\": \"825 ГБ SSD\", \"features\": [\"Дисковод Ultra HD Blu-ray\", \"Поддержка Ray Tracing\", \"Tempest 3D Audio\", \"SSD накопитель\"], \"resolution\": \"4K\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/ps5_standard.jpg\"]'),
(2725, 'Xbox Series S', 'xbox-series-s', 29990.00, 34990.00, 'Компактная игровая консоль Microsoft для игр в 1440p', 'gaming', 'Microsoft', 4.60, 234, 0, 14, 25, '{\"type\": \"Игровая консоль\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Цифровая версия\", \"Поддержка 120 FPS\", \"Ray Tracing\", \"Quick Resume\"], \"resolution\": \"1440p\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/xbox_series_s.jpg\"]'),
(2727, 'Steam Deck OLED 512GB', 'steam-deck-oled-512gb', 59990.00, 69990.00, 'Портативная игровая консоль от Valve с OLED-экраном', 'gaming', 'Valve', 4.80, 156, 1, 14, 10, '{\"type\": \"Портативная ПК-консоль\", \"screen\": \"7.4\\\" OLED\", \"storage\": \"512 ГБ\", \"features\": [\"Steam OS\", \"Поддержка игр из библиотеки Steam\", \"Сенсорные панели\", \"Многозадачность\"], \"processor\": \"AMD APU\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/steam_deck.jpg\"]'),
(2728, 'PlayStation VR2', 'playstation-vr2', 49990.00, 59990.00, 'Виртуальная реальность следующего поколения для PS5', 'gaming', 'Sony', 4.70, 98, 1, 17, 6, '{\"type\": \"VR-гарнитура\", \"features\": [\"Глазное отслеживание\", \"HDR дисплей\", \"Тактильная отдача\", \"3D-аудио\"], \"resolution\": \"2000x2040 на глаз\", \"field_of_view\": \"110°\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/psvr2.jpg\"]'),
(2729, 'DualSense Edge контроллер', 'dualsense-edge-controller', 14990.00, 17990.00, 'Профессиональный контроллер для PlayStation 5 с настройками', 'gaming', 'Sony', 4.60, 67, 1, 17, 18, '{\"type\": \"Игровой контроллер\", \"battery\": \"До 8 часов\", \"features\": [\"Сменные стики\", \"Задние клавиши\", \"Профили настроек\", \"Проводное подключение\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/dualsense_edge.jpg\"]'),
(2730, 'Игра God of War Ragnarök', 'god-of-war-ragnarok', 3990.00, 4990.00, 'Эксклюзивная игра для PlayStation 5 о Кратосе и Атрее', 'gaming', 'Santa Monica Studio', 4.90, 456, 0, 20, 40, '{\"type\": \"Игра\", \"genre\": \"Action-adventure\", \"features\": [\"Синглплеер\", \"Графика 4K\", \"60 FPS\", \"3D-аудио\"], \"platform\": \"PS5\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Gaming/gow_ragnarok.jpg\"]'),
(2731, 'Наушники Apple AirPods Pro 2', 'airpods-pro-2', 23990.00, 27990.00, 'Беспроводные наушники с активным шумоподавлением от Apple', 'headphones', 'Apple', 4.80, 678, 1, 14, 35, '{\"anc\": true, \"type\": \"TWS наушники\", \"battery\": \"До 30 часов с кейсом\", \"features\": [\"Адаптивный ANC\", \"Пространственное аудио\", \"MagSafe зарядка\", \"Кейс с динамиком\"], \"waterproof\": \"IPX4\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/airpods_pro2.jpg\"]'),
(2732, 'Наушники Sony WH-1000XM4', 'sony-wh-1000xm4', 27990.00, 32990.00, 'Флагманские наушники с активным шумоподавлением от Sony', 'headphones', 'Sony', 4.90, 890, 0, 15, 28, '{\"anc\": true, \"type\": \"Накладные\", \"battery\": \"До 30 часов\", \"features\": [\"Мультиточечное подключение\", \"Голосовой ассистент\", \"Касания для управления\", \"Атмосферное давление оптимизация\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/sony_xm4.jpg\"]'),
(2733, 'Колонка JBL Charge 5', 'jbl-charge-5', 10990.00, 12990.00, 'Портативная колонка с мощным звуком и защитой от воды', 'headphones', 'JBL', 4.70, 345, 0, 15, 45, '{\"type\": \"Портативная колонка\", \"power\": \"30 Вт\", \"battery\": \"20 часов\", \"features\": [\"PartyBoost\", \"Powerbank функция\", \"Прочный корпус\", \"Басовый излучатель\"], \"waterproof\": \"IP67\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/jbl_charge5.jpg\"]');
INSERT INTO `products` (`id`, `name`, `slug`, `price`, `old_price`, `description`, `category_slug`, `brand`, `rating`, `reviews_count`, `is_new`, `discount`, `stock`, `specifications`, `is_active`, `created_at`, `updated_at`, `image_url`) VALUES
(2734, 'Саундбар Samsung HW-Q600B', 'samsung-hw-q600b', 32990.00, 39990.00, 'Саундбар с Dolby Atmos и беспроводным сабвуфером', 'headphones', 'Samsung', 4.60, 123, 1, 17, 15, '{\"type\": \"Саундбар\", \"power\": \"360 Вт\", \"channels\": \"3.1.2\", \"features\": [\"Dolby Atmos\", \"DTS:X\", \"Q-Symphony\", \"Адаптивный звук\", \"Wi-Fi, Bluetooth\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/samsung_soundbar.jpg\"]'),
(2735, 'Наушники Sennheiser Momentum 4', 'sennheiser-momentum-4', 34990.00, 41990.00, 'Беспроводные наушники с премиальным звуком от Sennheiser', 'headphones', 'Sennheiser', 4.80, 234, 1, 17, 12, '{\"anc\": true, \"type\": \"Накладные\", \"battery\": \"До 60 часов\", \"features\": [\"Активное шумоподавление\", \"Высокое разрешение звука\", \"Элегантный дизайн\", \"Сенсорное управление\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/sennheiser_momentum4.jpg\"]'),
(2736, 'Наушники Beats Studio Pro', 'beats-studio-pro', 28990.00, 34990.00, 'Наушники с улучшенным шумоподавлением от Beats', 'headphones', 'Beats', 4.50, 156, 1, 17, 20, '{\"anc\": true, \"type\": \"Накладные\", \"battery\": \"До 40 часов\", \"features\": [\"Прозрачный режим\", \"Пространственное аудио\", \"Быстрая зарядка\", \"Удобная складная конструкция\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/beats_studio_pro.jpg\"]'),
(2737, 'Bluetooth-адаптер FiiO BTR5', 'fiio-btr5', 7990.00, 9990.00, 'Портативный усилитель и Bluetooth-адаптер для наушников', 'headphones', 'FiiO', 4.40, 89, 0, 20, 25, '{\"dac\": \"ES9218P\", \"type\": \"Аудиоадаптер\", \"features\": [\"Высокое разрешение\", \"OLED дисплей\", \"Два выхода\", \"До 9 часов работы\"], \"bluetooth\": \"5.0\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/fiio_btr5.jpg\"]'),
(2738, 'Игровые наушники HyperX Cloud Alpha', 'hyperx-cloud-alpha', 6990.00, 8990.00, 'Игровые наушники с раздельной звуковой камерой', 'headphones', 'HyperX', 4.70, 567, 0, 22, 40, '{\"type\": \"Игровые наушники\", \"features\": [\"Двойные звуковые камеры\", \"Алюминиевая рама\", \"Памятная пена\", \"Прочный кабель\"], \"connection\": \"3.5 мм\", \"microphone\": \"Съемный\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/hyperx_cloud_alpha.jpg\"]'),
(2739, 'Наушники Marshall Major IV', 'marshall-major-4', 12990.00, 15990.00, 'Накладные наушники в культовом дизайне Marshall', 'headphones', 'Marshall', 4.50, 234, 0, 19, 30, '{\"type\": \"Накладные\", \"battery\": \"До 80 часов\", \"features\": [\"Быстрая зарядка\", \"Кнопка многозадачности\", \"Складная конструкция\", \"Классический дизайн Marshall\"], \"bluetooth\": \"5.0\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/marshall_major4.jpg\"]'),
(2740, 'Наушники Xiaomi Redmi Buds 4 Pro', 'xiaomi-redmi-buds-4-pro', 4990.00, 6990.00, 'Бюджетные TWS наушники с шумоподавлением от Xiaomi', 'headphones', 'Xiaomi', 4.30, 789, 1, 29, 60, '{\"anc\": true, \"type\": \"TWS наушники\", \"battery\": \"До 36 часов\", \"features\": [\"Активное шумоподавление\", \"Bluetooth 5.3\", \"Касания для управления\", \"Режим прозрачности\"], \"waterproof\": \"IP54\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Headphones/xiaomi_buds4pro.jpg\"]'),
(2741, 'Ноутбук Apple MacBook Air 13\" M3', 'apple-macbook-air-13-m3', 99990.00, 109990.00, 'Ультрабук с чипом Apple M3, Retina-дисплеем и долгой автономностью', 'laptops', 'Apple', 4.80, 234, 1, 9, 18, '{\"os\": \"macOS\", \"ram\": \"8 ГБ\", \"weight\": \"1.24 кг\", \"battery\": \"До 18 часов\", \"display\": \"13.6\\\" Retina\", \"storage\": \"256 ГБ SSD\", \"features\": [\"MagSafe 3\", \"1080p камера\", \"Touch ID\", \"Бесшумная работа\"], \"processor\": \"Apple M3\", \"resolution\": \"2560x1664\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/macbook_air_m3.jpg\"]'),
(2742, 'Игровой ноутбук ASUS TUF Gaming F15', 'asus-tuf-gaming-f15', 79990.00, 89990.00, 'Доступный игровой ноутбук с GeForce RTX 4060 и процессором Intel Core i7', 'laptops', 'ASUS', 4.60, 189, 0, 11, 22, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ DDR5\", \"weight\": \"2.2 кг\", \"display\": \"15.6\\\" IPS\", \"storage\": \"512 ГБ SSD\", \"graphics\": \"NVIDIA GeForce RTX 4060 8GB\", \"processor\": \"Intel Core i7-13650HX\", \"resolution\": \"1920x1080\", \"refresh_rate\": \"144 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/asus_tuf_f15.jpg\"]'),
(2743, 'Ноутбук Lenovo IdeaPad Slim 5', 'lenovo-ideapad-slim-5', 54990.00, 64990.00, 'Стильный ультрабук с сенсорным экраном для работы и учебы', 'laptops', 'Lenovo', 4.50, 156, 1, 15, 30, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ\", \"weight\": \"1.47 кг\", \"battery\": \"До 12 часов\", \"display\": \"14\\\" IPS touch\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Сенсорный экран\", \"Стилус поддержка\", \"Быстрая зарядка\"], \"processor\": \"AMD Ryzen 7 7730U\", \"resolution\": \"2880x1800\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/lenovo_ideapad_slim5.jpg\"]'),
(2744, 'Игровой ноутбук MSI Katana 15', 'msi-katana-15', 89990.00, 99990.00, 'Мощный игровой ноутбук с RTX 4070 и процессором Intel 13-го поколения', 'laptops', 'MSI', 4.70, 123, 1, 10, 12, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ DDR5\", \"weight\": \"2.25 кг\", \"display\": \"15.6\\\" IPS\", \"storage\": \"1 ТБ SSD\", \"graphics\": \"NVIDIA GeForce RTX 4070 8GB\", \"processor\": \"Intel Core i7-13620H\", \"resolution\": \"2560x1440\", \"refresh_rate\": \"165 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/msi_katana15.jpg\"]'),
(2745, 'Ноутбук HP Pavilion 14', 'hp-pavilion-14', 44990.00, 52990.00, 'Универсальный ноутбук для повседневных задач с тонким корпусом', 'laptops', 'HP', 4.40, 89, 0, 15, 35, '{\"os\": \"Windows 11\", \"ram\": \"8 ГБ\", \"weight\": \"1.41 кг\", \"battery\": \"До 10 часов\", \"display\": \"14\\\" IPS\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Ультратонкий\", \"Быстрая зарядка\", \"HD камера с шумоподавлением\"], \"processor\": \"Intel Core i5-1335U\", \"resolution\": \"1920x1080\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/hp_pavilion14.jpg\"]'),
(2746, 'Ноутбук Dell XPS 13 Plus', 'dell-xps-13-plus', 129990.00, 149990.00, 'Флагманский ультрабук с безрамочным дисплеем и тактовой панелью', 'laptops', 'Dell', 4.80, 78, 1, 13, 8, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ LPDDR5\", \"weight\": \"1.26 кг\", \"battery\": \"До 15 часов\", \"display\": \"13.4\\\" OLED\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Тактовая панель\", \"Безрамочный дисплей\", \"Камера 1080p\", \"Качество сборки премиум\"], \"processor\": \"Intel Core i7-1360P\", \"resolution\": \"3456x2160\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/dell_xps13plus.jpg\"]'),
(2747, 'Игровой ноутбук Acer Nitro 5', 'acer-nitro-5', 69990.00, 79990.00, 'Популярный игровой ноутбук с хорошим соотношением цены и производительности', 'laptops', 'Acer', 4.50, 345, 0, 13, 25, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ\", \"weight\": \"2.4 кг\", \"display\": \"15.6\\\" IPS\", \"storage\": \"512 ГБ SSD\", \"graphics\": \"NVIDIA GeForce RTX 4050 6GB\", \"processor\": \"AMD Ryzen 7 7735HS\", \"resolution\": \"1920x1080\", \"refresh_rate\": \"144 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/acer_nitro5.jpg\"]'),
(2748, 'Ноутбук Microsoft Surface Laptop 5', 'microsoft-surface-laptop-5', 109990.00, 119990.00, 'Премиум ноутбук с сенсорным экраном PixelSense и Alcantara покрытием', 'laptops', 'Microsoft', 4.70, 67, 0, 8, 15, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ\", \"weight\": \"1.3 кг\", \"battery\": \"До 18 часов\", \"display\": \"13.5\\\" PixelSense\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Сенсорный экран\", \"Alcantara клавиатура\", \"Матовое стекло\", \"Thunderbolt 4\"], \"processor\": \"Intel Core i7-1255U\", \"resolution\": \"2256x1504\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/surface_laptop5.jpg\"]'),
(2749, 'Ноутбук Huawei MateBook D 16', 'huawei-matebook-d-16', 64990.00, 74990.00, 'Ноутбук с большим экраном 16 дюймов и тонкими рамками', 'laptops', 'Huawei', 4.60, 123, 1, 13, 20, '{\"os\": \"Windows 11\", \"ram\": \"16 ГБ\", \"weight\": \"1.7 кг\", \"battery\": \"До 12 часов\", \"display\": \"16\\\" IPS\", \"storage\": \"512 ГБ SSD\", \"features\": [\"Тонкие рамки\", \"Камера скрытая\", \"Быстрая зарядка\", \"Metal корпус\"], \"processor\": \"Intel Core i5-12450H\", \"resolution\": \"1920x1200\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/huawei_matebook16.jpg\"]'),
(2750, 'Ноутбук Apple MacBook Pro 14\" M3 Pro', 'apple-macbook-pro-14-m3-pro', 189990.00, 209990.00, 'Профессиональный ноутбук с чипом M3 Pro и дисплеем Liquid Retina XDR', 'laptops', 'Apple', 4.90, 56, 1, 10, 6, '{\"os\": \"macOS\", \"ram\": \"18 ГБ\", \"weight\": \"1.6 кг\", \"battery\": \"До 18 часов\", \"display\": \"14.2\\\" Liquid Retina XDR\", \"storage\": \"512 ГБ SSD\", \"features\": [\"ProMotion 120 Гц\", \"1080p камера\", \"Шесть динамиков\", \"Порты HDMI и SDXC\"], \"processor\": \"Apple M3 Pro\", \"resolution\": \"3024x1964\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Laptops/macbook_pro14.jpg\"]'),
(2751, 'Телевизор LG OLED C3 55\"', 'lg-oled-c3-55', 99990.00, 119990.00, 'OLED телевизор с процессором α9 Gen6 и поддержкой всех форматов HDR', 'tvs', 'LG', 4.80, 234, 1, 17, 15, '{\"hdr\": \"Dolby Vision, HDR10, HLG\", \"diagonal\": \"55\\\"\", \"features\": [\"Dolby Atmos\", \"AI Sound Pro\", \"HDMI 2.1\", \"G-SYNC Compatible\"], \"smart_tv\": \"webOS\", \"resolution\": \"4K\", \"technology\": \"OLED\", \"refresh_rate\": \"120 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/lg_oled_c3.jpg\"]'),
(2752, 'Телевизор Samsung Neo QLED 65\" QN95C', 'samsung-neo-qled-65-qn95c', 149990.00, 179990.00, 'Флагманский телевизор с технологией Neo QLED и мини-светодиодной подсветкой', 'tvs', 'Samsung', 4.90, 189, 1, 17, 8, '{\"hdr\": \"HDR10+, HLG\", \"diagonal\": \"65\\\"\", \"features\": [\"One Connect Box\", \"Object Tracking Sound Pro\", \"AMD FreeSync Premium Pro\", \"Anti-glare coating\"], \"smart_tv\": \"Tizen\", \"resolution\": \"4K\", \"technology\": \"Neo QLED\", \"refresh_rate\": \"144 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/samsung_qn95c.jpg\"]'),
(2753, 'Телевизор Sony BRAVIA XR-55A80L', 'sony-bravia-xr-55a80l', 109990.00, 129990.00, 'OLED телевизор с когнитивным процессором XR от Sony', 'tvs', 'Sony', 4.80, 156, 0, 15, 12, '{\"hdr\": \"Dolby Vision, HDR10, HLG\", \"diagonal\": \"55\\\"\", \"features\": [\"Acoustic Surface Audio+\", \"XR Clear Image\", \"XR Triluminos Pro\", \"Hands-free voice control\"], \"smart_tv\": \"Google TV\", \"resolution\": \"4K\", \"technology\": \"OLED\", \"refresh_rate\": \"120 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/sony_a80l.jpg\"]'),
(2754, 'Телевизор TCL 43\" 4K Android TV', 'tcl-43-4k-android-tv', 29990.00, 39990.00, 'Доступный 4K телевизор с платформой Android TV', 'tvs', 'TCL', 4.30, 456, 0, 25, 40, '{\"hdr\": \"HDR10, HLG\", \"diagonal\": \"43\\\"\", \"features\": [\"Голосовое управление\", \"Google Assistant\", \"Chromecast built-in\", \"Dolby Audio\"], \"smart_tv\": \"Android TV\", \"resolution\": \"4K\", \"technology\": \"LED\", \"refresh_rate\": \"60 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/tcl_android.jpg\"]'),
(2755, 'Телевизор Philips 50\" Ambilight', 'philips-50-ambilight', 54990.00, 64990.00, 'Телевизор с фирменной технологией Ambilight для погружения в контент', 'tvs', 'Philips', 4.60, 123, 1, 15, 20, '{\"hdr\": \"Dolby Vision, HDR10+\", \"diagonal\": \"50\\\"\", \"features\": [\"Ambilight 3-sided\", \"P5 Processor\", \"Dolby Vision\", \"Harman Kardon звук\"], \"smart_tv\": \"Android TV\", \"resolution\": \"4K\", \"technology\": \"LED\", \"refresh_rate\": \"60 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/philips_ambilight.jpg\"]'),
(2756, 'Телевизор Hisense 75\" ULED', 'hisense-75-uled', 79990.00, 99990.00, 'Большой телевизор с технологией ULED и местным затемнением', 'tvs', 'Hisense', 4.50, 89, 1, 20, 10, '{\"hdr\": \"Dolby Vision, HDR10+\", \"diagonal\": \"75\\\"\", \"features\": [\"Full Array Local Dimming\", \"Quantum Dot Color\", \"Game Mode Pro\", \"IMAX Enhanced\"], \"smart_tv\": \"Vidaa U\", \"resolution\": \"4K\", \"technology\": \"ULED\", \"refresh_rate\": \"120 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/hisense_uled.jpg\"]'),
(2757, 'Телевизор Xiaomi TV A2 55\"', 'xiaomi-tv-a2-55', 42990.00, 52990.00, 'Умный телевизор от Xiaomi с тонким дизайном и хорошим звуком', 'tvs', 'Xiaomi', 4.40, 345, 0, 19, 30, '{\"hdr\": \"HDR10+, HLG\", \"diagonal\": \"55\\\"\", \"features\": [\"PatchWall\", \"Dolby Audio\", \"Голосовое управление\", \"Тонкий металлический корпус\"], \"smart_tv\": \"Android TV\", \"resolution\": \"4K\", \"technology\": \"LED\", \"refresh_rate\": \"60 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/xiaomi_tv_a2.jpg\"]'),
(2758, 'Телевизор LG NanoCell 65\"', 'lg-nanocell-65', 69990.00, 84990.00, 'Телевизор с технологией NanoCell для чистых цветов и широких углов обзора', 'tvs', 'LG', 4.50, 178, 0, 18, 18, '{\"hdr\": \"HDR10, HLG\", \"diagonal\": \"65\\\"\", \"features\": [\"Nano Color\", \"Nano Black\", \"HDMI 2.1\", \"Dolby Atmos\"], \"smart_tv\": \"webOS\", \"resolution\": \"4K\", \"technology\": \"NanoCell\", \"refresh_rate\": \"120 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/lg_nanocell.jpg\"]'),
(2759, 'Телевизор Samsung The Frame 55\"', 'samsung-the-frame-55', 129990.00, 149990.00, 'Телевизор, превращающийся в картину, с изменяющимися рамками', 'tvs', 'Samsung', 4.70, 234, 1, 13, 12, '{\"hdr\": \"HDR10+\", \"diagonal\": \"55\\\"\", \"features\": [\"Art Mode\", \"Матовый экран\", \"Изменяемые рамки\", \"Накопитель для арт-контента\"], \"smart_tv\": \"Tizen\", \"resolution\": \"4K\", \"technology\": \"QLED\", \"refresh_rate\": \"120 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/samsung_frame.jpg\"]'),
(2760, 'Телевизор Sony BRAVIA 43\" Full HD', 'sony-bravia-43-full-hd', 32990.00, 39990.00, 'Компактный телевизор с процессором X1 от Sony', 'tvs', 'Sony', 4.30, 189, 0, 18, 25, '{\"hdr\": \"HDR10\", \"diagonal\": \"43\\\"\", \"features\": [\"X1 Processor\", \"ClearAudio+\", \"Voice search\", \"Light sensor\"], \"smart_tv\": \"Google TV\", \"resolution\": \"Full HD\", \"technology\": \"LED\", \"refresh_rate\": \"60 Гц\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/TVs/sony_bravia_fhd.jpg\"]'),
(2761, 'Умная колонка Яндекс Станция 2', 'yandex-station-2', 9990.00, 12990.00, 'Умная колонка с Алисой, качественным звуком и экраном', 'smarthouse', 'Яндекс', 4.60, 789, 0, 23, 50, '{\"type\": \"Умная колонка\", \"screen\": \"8\\\"\", \"features\": [\"Управление умным домом\", \"Видеозвонки\", \"Просмотр видео\", \"Детский режим\"], \"speakers\": \"2 динамика 15 Вт\", \"assistant\": \"Алиса\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/yandex_station2.jpg\"]'),
(2762, 'Умная лампочка Xiaomi Yeelight', 'xiaomi-yeelight-bulb', 1290.00, 1990.00, 'Умная LED лампочка с изменением цвета и управлением через приложение', 'smarthouse', 'Xiaomi', 4.50, 1234, 0, 35, 100, '{\"type\": \"Умная лампочка\", \"wifi\": true, \"features\": [\"16 млн цветов\", \"Таймер\", \"Ночник режим\", \"Совместимость с Google Home, Alexa\"], \"brightness\": \"800 люмен\", \"color_temp\": \"1700-6500K\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/xiaomi_yeelight.jpg\"]'),
(2763, 'Видеодомофон Ezviz DB1', 'ezviz-db1-video-doorbell', 7990.00, 9990.00, 'Беспроводной видеодомофон с ночным видением и обнаружением движения', 'smarthouse', 'Ezviz', 4.40, 456, 1, 20, 35, '{\"type\": \"Видеодомофон\", \"battery\": \"До 6 месяцев\", \"features\": [\"Обнаружение человека\", \"Двусторонняя аудиосвязь\", \"Встроенный сиреной\", \"Защита от погоды\"], \"resolution\": \"2K\", \"night_vision\": true}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/ezviz_db1.jpg\"]'),
(2764, 'Умная розетка TP-Link Tapo P100', 'tp-link-tapo-p100', 990.00, 1490.00, 'Умная Wi-Fi розетка с управлением через приложение', 'smarthouse', 'TP-Link', 4.30, 2345, 0, 34, 200, '{\"type\": \"Умная розетка\", \"wifi\": true, \"power\": \"16A\", \"features\": [\"Таймер включения/выключения\", \"Расписание\", \"Управление голосом\", \"Отслеживание энергопотребления\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/tplink_tapo.jpg\"]'),
(2765, 'Умный замок Aqara Smart Lock', 'aqara-smart-lock', 14990.00, 18990.00, 'Умный дверной замок с отпечатком пальца и кодовым доступом', 'smarthouse', 'Aqara', 4.70, 123, 1, 21, 15, '{\"type\": \"Умный замок\", \"battery\": \"8 месяцев\", \"features\": [\"Шифрование данных\", \"Автоматическая блокировка\", \"Временные коды\", \"История доступа\"], \"unlock_methods\": [\"Отпечаток\", \"Пин-код\", \"Карта\", \"Ключ\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/aqara_lock.jpg\"]'),
(2766, 'Умный термостат Nest Learning Thermostat', 'nest-learning-thermostat', 19990.00, 24990.00, 'Умный термостат, который изучает ваши привычки и экономит энергию', 'smarthouse', 'Google', 4.80, 345, 0, 20, 12, '{\"type\": \"Умный термостат\", \"features\": [\"Авто-расписание\", \"Удаленное управление\", \"Отчеты об энергосбережении\", \"Farsight дисплей\"], \"learning\": true, \"compatibility\": \"Многие системы отопления\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/nest_thermostat.jpg\"]'),
(2767, 'Система безопасности Ring Alarm 8 Piece', 'ring-alarm-8-piece', 29990.00, 39990.00, 'Комплект безопасности для дома с датчиками и хабом', 'smarthouse', 'Ring', 4.60, 234, 1, 25, 8, '{\"type\": \"Система безопасности\", \"features\": [\"Профессиональный мониторинг\", \"Мобильные уведомления\", \"Резервный аккумулятор\", \"Сотовая связь\"], \"components\": [\"Базовая станция\", \"Клавиатура\", \"Датчик движения\", \"Датчик открытия дверей/окон\", \"Датчик открытия дверей/окон (2 шт.)\", \"Датчик открытия дверей/окон (3 шт.)\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/ring_alarm.jpg\"]'),
(2768, 'Умный датчик дыма Xiaomi Honeywell', 'xiaomi-honeywell-smoke-detector', 2990.00, 3990.00, 'Умный датчик дыма с Wi-Fi и push-уведомлениями', 'smarthouse', 'Xiaomi', 4.50, 567, 0, 25, 40, '{\"type\": \"Датчик дыма\", \"wifi\": true, \"power\": \"Батарейка CR123A\", \"features\": [\"Громкая сирена\", \"Проверка работоспособности\", \"Уведомления в приложении\", \"Совместимость с другими устройствами умного дома\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/xiaomi_smoke.jpg\"]'),
(2769, 'Умный увлажнитель воздуха Xiaomi Smartmi', 'xiaomi-smartmi-humidifier', 5990.00, 7990.00, 'Умный увлажнитель с управлением через приложение и контролем влажности', 'smarthouse', 'Xiaomi', 4.40, 345, 1, 25, 30, '{\"type\": \"Умный увлажнитель\", \"wifi\": true, \"capacity\": \"4 л\", \"coverage\": \"25 м²\", \"features\": [\"Автоматическое поддержание влажности\", \"Таймер\", \"Ночной режим\", \"Заправка сверху\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/xiaomi_humidifier.jpg\"]'),
(2770, 'Умная камера для дома Ezviz C8C', 'ezviz-c8c-security-camera', 6490.00, 8490.00, 'Уличная умная камера с PTZ и цветным ночным видением', 'smarthouse', 'Ezviz', 4.60, 456, 0, 24, 25, '{\"type\": \"Умная камера\", \"features\": [\"Обнаружение человека\", \"Автоматическое слежение\", \"Двусторонняя связь\", \"Защита IP67\"], \"pan_tilt\": \"360°/125°\", \"resolution\": \"2K\", \"night_vision\": \"Цветная\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/SmartHome/ezviz_c8c.jpg\"]'),
(2771, 'Зеркальный фотоаппарат Canon EOS R6 Mark II', 'canon-eos-r6-mark-ii', 189990.00, 219990.00, 'Полнокадровая беззеркальная камера для профессионалов и энтузиастов', 'photo', 'Canon', 4.90, 123, 1, 14, 8, '{\"iso\": \"100-102400\", \"type\": \"Беззеркальная камера\", \"video\": \"6K RAW\", \"sensor\": \"Full Frame 24.2 МП\", \"features\": [\"40 кадров/с\", \"Двойной слот для карт\", \"Сенсорный экран с переменным углом\", \"Wi-Fi, Bluetooth\"], \"stabilization\": \"IBIS 8 ступеней\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/canon_r6ii.jpg\"]'),
(2772, 'Объектив Sony FE 24-70mm f/2.8 GM II', 'sony-fe-24-70mm-f2-8-gm-ii', 129990.00, 149990.00, 'Универсальный зум-объектив для полнокадровых камер Sony', 'photo', 'Sony', 4.80, 89, 1, 13, 10, '{\"type\": \"Зум-объектив\", \"aperture\": \"f/2.8\", \"features\": [\"Стекло XA\", \"Нано-покрытие\", \"Быстрая и тихая автофокусировка\", \"Защита от пыли и влаги\"], \"focal_length\": \"24-70mm\", \"stabilization\": \"OSS\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/sony_2470.jpg\"]'),
(2773, 'Беззеркальная камера Sony A7 IV', 'sony-a7-iv', 149990.00, 179990.00, 'Универсальная полнокадровая камера для фото и видео', 'photo', 'Sony', 4.90, 234, 0, 17, 12, '{\"iso\": \"100-51200\", \"type\": \"Беззеркальная камера\", \"video\": \"4K 60p\", \"sensor\": \"Full Frame 33 МП\", \"features\": [\"Режим S-Cinetone\", \"10 бит 4:2:2\", \"Двойной слот для карт\", \"Полностью шарнирный экран\"], \"stabilization\": \"IBIS 5.5 ступеней\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/sony_a7iv.jpg\"]'),
(2774, 'Экшн-камера GoPro HERO12 Black', 'gopro-hero12-black', 39990.00, 49990.00, 'Новейшая экшн-камера с улучшенной стабилизацией и временем работы', 'photo', 'GoPro', 4.70, 456, 1, 20, 25, '{\"type\": \"Экшн-камера\", \"video\": \"5.3K 60fps\", \"sensor\": \"1/1.9\\\"\", \"battery\": \"До 2.5 часов\", \"features\": [\"Защита от воды 10м\", \"HDR видео\", \"Ночные режимы\", \"Live streaming\"], \"stabilization\": \"HyperSmooth 6.0\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/gopro_hero12.jpg\"]'),
(2775, 'Фотоаппарат Fujifilm X-T5', 'fujifilm-x-t5', 129990.00, 149990.00, 'Ретро-стиль камера с высоким разрешением и классическим управлением', 'photo', 'Fujifilm', 4.80, 156, 1, 13, 15, '{\"iso\": \"125-12800\", \"type\": \"Беззеркальная камера\", \"video\": \"6.2K 30p\", \"sensor\": \"APS-C 40.2 МП\", \"features\": [\"19 фильмов Fujifilm\", \"Механические диски\", \"Двойной слот UHS-II\", \"Устойчивость к погоде\"], \"stabilization\": \"IBIS 7 ступеней\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/fujifilm_xt5.jpg\"]'),
(2776, 'Объектив Nikon NIKKOR Z 50mm f/1.8 S', 'nikon-nikkor-z-50mm-f1-8-s', 34990.00, 42990.00, 'Светосильный портретный объектив для беззеркальных камер Nikon Z', 'photo', 'Nikon', 4.70, 234, 0, 19, 20, '{\"type\": \"Фикс-объектив\", \"aperture\": \"f/1.8\", \"features\": [\"Нано Crystal Coat\", \"Быстрая и точная автофокусировка\", \"Защита от пыли и влаги\", \"Высокое качество сборки\"], \"focal_length\": \"50mm\", \"stabilization\": \"Нет\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/nikon_50mm.jpg\"]'),
(2777, 'Компактная камера Sony ZV-1 II', 'sony-zv-1-ii', 59990.00, 69990.00, 'Компактная камера для влогеров с улучшенным звуком и углом обзора', 'photo', 'Sony', 4.60, 345, 1, 14, 30, '{\"lens\": \"18-50mm эквивалент\", \"type\": \"Компактная камера\", \"video\": \"4K 30p\", \"sensor\": \"1\\\"\", \"features\": [\"Встроенный микрофон с ветрозащитой\", \"Артикуляционный экран\", \"Фоновое размытие\", \"Продуктовый режим\"]}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/sony_zv1ii.jpg\"]'),
(2778, 'Штатив Manfrotto Befree Advanced', 'manfrotto-befree-advanced', 14990.00, 18990.00, 'Портативный алюминиевый штатив для путешествий', 'photo', 'Manfrotto', 4.50, 567, 0, 21, 40, '{\"type\": \"Штатив\", \"features\": [\"Быстрое открывание\", \"Регулируемые ноги\", \"Шаровое крепление\", \"Защита от песка и воды\"], \"material\": \"Алюминий\", \"max_load\": \"8 кг\", \"max_height\": \"150 см\", \"folded_length\": \"40 см\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/manfrotto_befree.jpg\"]'),
(2779, 'Вспышка Godox V1', 'godox-v1-flash', 12990.00, 15990.00, 'Круглая вспышка с магнитной системой аксессуаров', 'photo', 'Godox', 4.60, 234, 0, 19, 35, '{\"type\": \"Внешняя вспышка\", \"battery\": \"Литий-ионный\", \"features\": [\"Круглая головка\", \"Магнитная система аксессуаров\", \"2.4 Гц беспроводная система\", \"Поддержка TTL\"], \"guide_number\": \"60\", \"recycle_time\": \"1.5 с\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/godox_v1.jpg\"]'),
(2780, 'Дрон DJI Mini 4 Pro', 'dji-mini-4-pro', 89990.00, 109990.00, 'Компактный дрон с препятствиями и камерой 4K/60fps', 'photo', 'DJI', 4.90, 456, 1, 18, 12, '{\"type\": \"Дрон\", \"video\": \"4K 100fps\", \"camera\": \"1/1.3\\\"\", \"weight\": \"249 г\", \"features\": [\"ActiveTrack 360°\", \"MasterShots\", \"Ночной режим\", \"До 34 минут полета\"], \"obstacle_sensors\": \"Омни-направленные\"}', 1, '2026-01-10 15:09:32', NULL, '[\"/images/products/Photo/dji_mini4pro.jpg\"]');

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
-- Структура таблицы `support_tickets`
--

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','in_progress','resolved','closed') DEFAULT 'new',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `admin_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `response` text,
  `responded_by` varchar(36) DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `ticket_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `priority`, `admin_notes`, `created_at`, `updated_at`, `response`, `responded_by`, `responded_at`, `ticket_number`) VALUES
(1, NULL, 'Kirill', 'vanyakorob2006@mail.ru', '89510880328', 'Вопрос по товару', 'Хочу вернуть товар', 'closed', 'medium', NULL, '2026-01-07 17:06:27', '2026-01-07 17:07:45', NULL, NULL, NULL, 'TICKET-2601-7059'),
(2, NULL, 'qipori', 'viktoriamezenceva115@gmail.com', '89516790953', 'Вопрос по товару', 'апаппа', 'resolved', 'medium', NULL, '2026-01-07 17:23:45', '2026-01-11 10:22:41', 'sdfg', '4d70129c-33d0-4379-ab10-24c64a3e30a9', '2026-01-11 10:22:41', 'TICKET-2601-0404');

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
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `avatar_url`, `role`, `is_active`, `created_at`, `address`, `updated_at`, `token`) VALUES
('120c29dc-5d2f-4157-91d3-89802d0aec44', 'user@mail.com', '$2b$12$tqbZ3KBffGqyb3lZURcAtu3ACTCWibYaFAETJQGUcmwh5QaeetagC', 'Евгений', 'Чивапчич', '', '', 'customer', 0, '0000-00-00 00:00:00', '', '0000-00-00 00:00:00', NULL),
('241a247d-ace2-11f0-8429-ac1f6bc600da', 'ad@mail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', NULL, NULL, 'admin', 0, '2025-10-19 11:52:51', NULL, '2026-01-11 16:42:03', NULL),
('4d70129c-33d0-4379-ab10-24c64a3e30a9', 'admin@mail.com', '$2b$12$Hdm8PQLH3l8RRJzzG0aCGOZEZZpqeX0wnNCtgn2S4l/EG1fjSN8.2', 'Ivan', 'Ivan', '89510880328', '', 'admin', 0, '0000-00-00 00:00:00', 'Курск, Парковая 14', '2026-01-28 17:45:45', '56a23dcc5639292ce8009d9c7d1ef162f98a619e0c13badb28cf173376da1738'),
('6d5629be-d385-11f0-aed8-ac1f6bc600da', 'viktoriamezenceva92@gmail.com', '$2y$10$6PFgdWt6UcUcdLQcTzAgeu1jr9Eaa5Z3m1SKQ7QxYPK0mynfUD6Oi', 'qipori', '', NULL, NULL, 'customer', 1, '2025-12-07 15:57:26', NULL, '2026-01-11 15:58:01', NULL),
('cb7bca23-945c-4b97-b016-1db63e2b4118', 'worker@store.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Иван', 'Петров', '+7 (999) 123-45-67', '', 'sales_assistant', 0, '0000-00-00 00:00:00', '', '0000-00-00 00:00:00', NULL),
('cc72c123-bfae-11f0-a705-ac1f6bc600da', 'saharoktop356@gmail.com', '$2y$10$XLE8IybsQqg3e9vu7HiNAung38NrL2bBxnWqkzA6Vg733Ye6X6fpe', 'Александр', 'Стариков', '+79508707585', NULL, '', 1, '2025-11-12 10:03:12', NULL, '2026-01-11 15:58:01', NULL),
('f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 'viktoriamezenceva115@gmail.com', '$2y$10$pG18L1Ud9ZVUF3L/hvMTA.pnA2kGEf/MDJBaqk2DoFb5mQeiYpHUi', 'qipori', '', '', '', 'customer', 0, '2026-01-07 17:22:38', '', '2026-01-11 17:28:10', '56cd4009435b51c3d74904c61d763d11da16a8b7bb5cd1a77ef80427f80fb7d0');

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

--
-- Дамп данных таблицы `user_cart`
--

INSERT INTO `user_cart` (`id`, `user_id`, `product_id`, `quantity`, `added_at`) VALUES
(40, '6d5629be-d385-11f0-aed8-ac1f6bc600da', 27, 1, '2025-12-07 15:57:59'),
(53, '120c29dc-5d2f-4157-91d3-89802d0aec44', 34, 1, '2025-12-07 19:23:25'),
(137, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 2733, 1, '2026-01-11 16:02:00'),
(138, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 2734, 1, '2026-01-11 16:02:08'),
(142, '4d70129c-33d0-4379-ab10-24c64a3e30a9', 2780, 1, '2026-01-28 17:40:04');

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
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `user_wishlist`
--

INSERT INTO `user_wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(21, 'cc72c123-bfae-11f0-a705-ac1f6bc600da', 34, '2025-11-27 13:28:16'),
(61, '6d5629be-d385-11f0-aed8-ac1f6bc600da', 27, '2025-12-07 15:58:01'),
(64, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 34, '2026-01-07 17:22:38'),
(65, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 36, '2026-01-07 17:22:38'),
(66, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 38, '2026-01-07 17:22:38'),
(67, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 32, '2026-01-07 17:22:38'),
(68, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 24, '2026-01-07 17:22:38'),
(74, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 2738, '2026-01-11 15:19:20'),
(75, 'f4c42b08-4b0a-44b2-a1ac-1b99fc3e0ad1', 2742, '2026-01-11 15:20:03');

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `category_filters`
--
ALTER TABLE `category_filters`
  ADD CONSTRAINT `fk_category_filters_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

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
