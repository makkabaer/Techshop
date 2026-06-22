-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 23. Jun 2026 um 01:05
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `techshop_db`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `categories`
--

INSERT INTO `categories` (`id`, `category_name`) VALUES
(1, 'CPU'),
(2, 'RAM'),
(3, 'GPU');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_price` decimal(10,2) NOT NULL,
  `delivery_address` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `invoice_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_date`, `total_price`, `delivery_address`, `status`, `invoice_number`) VALUES
(1, 4, '2026-06-02 10:18:29', 0.10, 'Teststraße 1, Wien', 'paid', NULL),
(2, 4, '2026-06-02 10:20:27', 0.05, 'Teststraße 1, Wien', 'paid', NULL),
(3, 4, '2026-06-02 10:55:12', 0.50, 'Teststraße 1, 1300, Wien', 'paid', NULL),
(4, 4, '2026-06-02 10:56:55', 0.55, 'kfvuzfv', 'paid', NULL),
(5, 4, '2026-06-02 10:57:39', 0.50, 'iohi', 'paid', NULL),
(6, 4, '2026-06-02 10:58:03', 0.05, '-élg', 'paid', NULL),
(7, 6, '2026-06-02 11:00:17', 0.20, '213', 'paid', NULL),
(8, 6, '2026-06-22 16:52:33', 450.00, 'Googlegasse 2', 'paid', 'INV-20260622-000001'),
(9, 4, '2026-06-22 19:27:53', 450.00, 'asd', 'paid', 'INV-20260622-000002');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(3, 3, 3, 1, 0.50),
(4, 4, 3, 1, 0.50),
(6, 5, 3, 1, 0.50),
(10, 8, 4, 1, 450.00),
(11, 9, 4, 1, 450.00);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `rating`, `image_path`, `created_at`, `category_id`) VALUES
(3, 'Kingston FURY 32GB KIT DDR5 6000MT/s CL36 Beast RGB EXPO', 'Arbeitsspeicher - 2 × 16GB in der Packung, Typ: DDR5, Frequenz: 6000 MHz, CL36-44-44, Durchlässigkeit: 48000 MB/s, Spannung: 1,35 V, Modul: PC5-48000, AMD EXPO, RGB-Hintergrundbeleuchtung', 415.00, 4.20, 'backend/productpictures/5809140653e2ecede278ac424320dc02.jpg', '2026-06-02 10:34:46', 2),
(4, 'Kingston FURY Beast 32GB (2x16GB) DDR5 6000MHz KF560C30BBEK2-32', 'Kingston FURY 32GB DDR5 6000 MT/s CL36 Beast EXPO Speicher wurde für Hochleistungs-Desktop- und Gaming-Setups entwickelt, bei denen hoher Datendurchsatz und niedrige Latenz erforderlich sind. Dieses DDR5-Speichermodul verfügt über sechzehn 2G×8-Bit-FBGA-Chips und unterstützt sowohl AMD EXPO v1.0- als auch Intel XMP 3.0-Profile. Dank der werksseitigen Tests ist ein stabiler Betrieb bei 1,35 V und 36-38-38 Zeitpunkten garantiert. Die Standard-SPD-Einstellung entspricht der JEDEC-Spezifikation DDR5-4800 mit 40-39-39 Timing bei 1,1 V. Das Modul verwendet ein 288-Pin-DIMM-Design mit Goldkontakten und ist mit einem passiven Kühlkörper ausgestattet.', 450.00, 4.50, 'backend/productpictures/e731290a8a408e7cc3d1aa67a7735b15.jpg', '2026-06-22 16:49:01', 2),
(5, 'G.SKILL 32GB KIT DDR5 6000MHz CL36 Flare X5 AMD EXPO', 'Arbeitsspeicher - 2 × 16GB in der Packung, Typ: DDR5, Frequenz: 6000 MHz, CL36-36-36-89, Durchlässigkeit: 48000 MB/s, Spannung: 1,35 V, Modul: PC5-48000, passiver Kühler und AMD EXPO', 432.00, 0.00, 'backend/productpictures/aba1c5a4b0ae41768fa64d6359fe889e.jpg', '2026-06-22 19:33:28', 2),
(6, 'AMD Ryzen 7 9800X3D, 8C/16T, 4.70-5.20GHz, boxed ohne Kühler', 'AMD 100-100001084WOF\r\nProcessore - Amd - Ryzen 7 9800x3d - 4,7 Ghz, 8 Core, 104 Mb L2 E L3, Am5', 400.00, 0.00, 'backend/productpictures/ff5e89e9e5993f3013cc71ea01bf0e41.jpg', '2026-06-22 19:34:58', 1),
(7, 'Intel® Core™ Ultra 7 270K Plus, Prozessor (Boxed-Version)', 'Die Intel® Core™ Ultra Desktop-Prozessoren unterstützen die Intel® AI Boost Technologie haben ein Chiplayout mit verschiedenen CPU-Kernen für verschiedene Anwendungsszenarien. Die Performance Cores sorgen für Leistung bei rechenintensiven Anwendungen, die Efficiency Cores für Energieeffizienz bei wenig Last. Die Core™ Ultra Prozessoren unterstützen PCIe Gen 5.0- und 4.0- sowie DDR5. Der Prozessor ist kompatibel mit Motherboards basierend auf dem Intel® 800 Chipsatz.', 325.00, 0.00, 'backend/productpictures/bb76839f0359873b4927308cc0b45356.jpg', '2026-06-22 19:36:29', 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(20) DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `full_name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `salutation` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `updated_at`, `role`, `is_active`, `full_name`, `address`, `salutation`, `first_name`, `last_name`, `postal_code`, `city`) VALUES
(4, 'asd', 'asd@fghj.com', '$2y$10$smaBuVODRgrgmYZR45OKDus2iLglI32bZQIJvkdmsVcVRUECvyNX6', '2026-05-10 14:07:35', '2026-06-02 10:25:34', 'user', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'admin', 'admin@techshop.com', '$2y$10$M3X3F3ca4B2KMKo08WVCiu6wJEfDFWsmWhX.LdA8gHHUj.wu80v5i', '2026-05-10 14:23:42', '2026-05-10 14:24:01', 'admin', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'wi24b18', 'iwas@domain.at', '$2y$10$oJmd9HgbEpuu5lby3jUwE.58fmTkEKc7HdNrUbydmu4f1cPcPB1Ye', '2026-06-02 10:59:31', '2026-06-22 16:57:03', 'user', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'ertb', 'ertb@gmail.com', '$2y$10$rQBugCgLyWd2fJ9CoTfO1uBYlRCU3DHpT5mdxCABFUOn/LGsKTZ3G', '2026-06-22 22:45:05', '2026-06-22 22:55:44', 'user', 1, 'Max Mustermann', 'Musterstraße 34', 'Mx', 'Max', 'Mustermann', '1400', 'wean');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indizes für die Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indizes für die Tabelle `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_category` (`category_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT für Tabelle `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
