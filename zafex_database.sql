-- ============================================================================
-- ZAFEX COLLECTIBLES - COMPLETE MYSQL DATABASE SCHEMA & SEED DATA
-- Compatible with Hostinger MySQL / phpMyAdmin / MariaDB / Local MySQL
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:30";

-- ----------------------------------------------------------------------------
-- 1. Table structure for table `users`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(500) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table structure for table `products`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `cat` VARCHAR(100) NOT NULL,
  `sub` VARCHAR(100) NOT NULL,
  `price` INT NOT NULL,
  `mrp` INT NULL,
  `discount` INT DEFAULT 0,
  `badge` VARCHAR(100) NULL,
  `image` VARCHAR(500) NOT NULL,
  `desc` TEXT NULL,
  `tags` JSON NULL,
  `in_stock` BOOLEAN NOT NULL DEFAULT TRUE,
  `stock_count` INT DEFAULT 100,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table structure for table `orders`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city` VARCHAR(100) NULL,
  `shipping_state` VARCHAR(100) NULL,
  `shipping_pincode` VARCHAR(50) NULL,
  `shipping_country` VARCHAR(100) DEFAULT 'India',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT 'razorpay',
  `razorpay_order_id` VARCHAR(255) NULL,
  `payment_id` VARCHAR(255) NULL,
  `payment_signature` VARCHAR(500) NULL,
  `total_amount` INT NOT NULL,
  `subtotal` INT NOT NULL DEFAULT 0,
  `shipping_cost` INT NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table structure for table `order_items`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `unit_price` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table structure for table `order_status_history`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table structure for table `cart`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table structure for table `wishlist`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table structure for table `reviews`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table structure for table `contacts`
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `subject` VARCHAR(255) NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Seed Data: Default Products Catalogue
-- ----------------------------------------------------------------------------
INSERT INTO `products` (`id`, `name`, `cat`, `sub`, `price`, `badge`, `image`, `desc`, `tags`, `in_stock`, `stock_count`) VALUES
('sw-1', 'Duelist Sword – Vanguard Black', 'weaponry', 'swords', 4800, 'new', '/images/sword.png', 'A sleek duelist blade forged for collectors and LARP enthusiasts. Durable polypropylene construction with a steel-grey finish. Perfect for display or reenactment.', '["sword", "larp", "duelist"]', 1, 100),
('sw-2', 'Duelist Sword – Vanguard Gold', 'weaponry', 'swords', 4800, 'new', '/images/swords.png', 'Gold-finished variant of the Vanguard series. An elegant display piece with balanced weight.', '["sword", "display"]', 1, 100),
('sw-3', 'Imperial Sword – Gold Edition', 'weaponry', 'swords', 9200, 'limited', '/images/sword.png', 'Museum-grade imperial longsword with ornamental gold crossguard. Limited collector\'s run.', '["sword", "limited", "imperial"]', 0, 0),
('ax-1', 'Viking Bearded Broadaxe', 'weaponry', 'axes-hammers', 7200, 'new', '/images/axe.png', 'Forged steel head on a solid ash handle. Based on Norse archaeological finds.', '["axe", "viking"]', 1, 100),
('ax-2', 'Battle Hammer – Iron Shod', 'weaponry', 'axes-hammers', 8000, NULL, '/images/hammers.png', 'Heavyweight flanged mace. German design, 14th century.', '["hammer", "mace"]', 1, 100),
('bow-1', 'Ranger\'s Elven Bow', 'weaponry', 'bows-arrows', 5500, 'new', '/images/bow.png', 'Elegant longbow crafted from laminated wood with engraved elven motifs. A must-have for LARP archers and fantasy collectors.', '["bow", "larp", "elven"]', 1, 100),
('sp-1', 'Ashwood Tournament Spear', 'weaponry', 'training-weapons', 4200, NULL, '/images/spears.png', 'Balanced training spear for reenactors. Safe rounded tip.', '["spear", "training"]', 1, 100),
('bp-1', 'Gothic Fluted Steel Breastplate', 'armour', 'breastplates', 20000, 'new', '/images/breastplates.png', 'Full-coverage gothic breastplate with distinctive fluted ridges for deflection. Hand-forged 16-gauge mild steel, polished to a mirror finish.', '["breastplate", "gothic", "steel"]', 1, 50),
('bp-2', 'Leather Breastplate – Ranger', 'armour', 'breastplates', 12000, NULL, '/images/leather-breastplates.png', 'Hardened leather cuirass with brass buckles. Lightweight protection for archers and rangers. Adjustable fit.', '["leather", "breastplate"]', 1, 50),
('hm-1', 'Norman Spangenhelm Helmet', 'armour', 'helmets', 14500, NULL, '/images/norman-helmet.png', 'Riveted segmented helmet based on 11th-century Norman design. Includes nasal bar. Mild steel construction.', '["helmet", "norman", "steel"]', 1, 50),
('hm-2', 'Barbuta Open-Face Helm', 'armour', 'helmets', 9800, NULL, '/images/gladitor-helmet.png', 'Italian-style open-faced helm of the 15th century. Provides excellent vision and ventilation for reenactors.', '["helmet", "italian", "barbuta"]', 1, 50),
('hm-3', 'Viking Spectacle Helmet', 'armour', 'helmets', 11200, NULL, '/images/viking-helmet.png', 'Characteristic spectacle guard helm inspired by Norse Vendel-period finds. Forged steel with applied bronze accents.', '["helmet", "viking"]', 0, 0),
('cm-1', 'Riveted Chainmail Hauberk', 'armour', 'chainmail', 15500, 'new', '/images/chainmail-shirt.png', 'Full-length riveted chainmail hauberk crafted from 8mm mild steel rings. Covers shoulders to mid-thigh. Battle-ready.', '["chainmail", "hauberk", "steel"]', 1, 50),
('cm-2', 'Steel Chainmail Coif', 'armour', 'chainmail', 6500, NULL, '/images/chainmail-coif.png', 'Head and neck protection in solid mild steel rings. Pairs with any helm or worn alone.', '["chainmail", "coif"]', 1, 50),
('sh-1', 'Viking Round Shield', 'armour', 'shields', 9500, NULL, '/images/round-shields.png', 'Hand-painted poplar wood shield with iron boss. Based on archaeological finds from Birka. Strap and grip included.', '["shield", "viking", "wooden"]', 1, 50),
('sh-2', 'Templar Heater Shield', 'armour', 'shields', 11000, NULL, '/images/tamplar-crusader-shields.png', 'Classic heater shield in 14-gauge steel with hand-painted Templar cross. Straps adjustable.', '["shield", "templar", "crusader"]', 1, 50),
('sh-3', 'Viking Kite Shield', 'armour', 'shields', 8800, NULL, '/images/viking-shield.png', 'Elongated kite shield offering full-body coverage. Linden wood with leather edge binding.', '["shield", "viking", "kite"]', 1, 50),
('cl-1', 'Classic Padded Cotton Gambeson', 'clothing', 'tabards', 9500, 'new', '/images/gambeson.png', 'Quilted padded gambeson for use under armour or standalone protection. Thick cotton batting, reinforced stitching.', '["gambeson", "padding", "clothing"]', 1, 100),
('cl-2', 'Viking Merchant Tunic', 'clothing', 'tunics', 4000, NULL, '/images/viking-tunic.png', 'Woven linen tunic with embroidered trim. Authentic Viking cut. Available in natural and undyed colours.', '["tunic", "viking", "linen"]', 1, 100),
('cl-3', 'Medieval Duchess Gown', 'clothing', 'cloaks-robes', 10000, NULL, '/images/1781973392758_gown.jpeg', 'Flowing brocade gown with lace-up back and flared sleeves. Ideal for festivals, LARP, and historical re-enactment.', '["gown", "medieval", "clothing"]', 1, 100),
('ac-1', 'Leather Sword Belt – Classic', 'accessories', 'belts', 2200, 'new', '/images/leather-belt.png', 'Full-grain leather sword belt with adjustable brass buckle. Fits blades up to 90 cm. Hand-stitched for durability.', '["belt", "leather", "sword"]', 1, 100),
('ac-2', 'Carved Drinking Horn', 'accessories', 'bags-pouches', 3200, NULL, '/images/drinking-horn.png', 'Authentic ox horn with carved runic patterns. Food-safe sealed interior. Comes with a braided leather stand.', '["drinking-horn", "viking", "accessory"]', 1, 100),
('ac-3', 'Knight\'s Pendant – Sterling', 'accessories', 'jewellery', 2400, 'new', '/images/horn-mug.png', 'Hand-cast sterling silver pendant shaped as a crusader shield. Comes on a 60 cm sterling chain.', '["pendant", "jewellery", "knight"]', 1, 100),
('ac-4', 'Embossed Leather Bracer', 'accessories', 'bags-pouches', 3900, NULL, '/images/leather-bracer.png', 'Pair of hardened leather bracers with embossed Celtic knotwork. Lace-up closure for a custom fit.', '["bracer", "leather", "celtic"]', 1, 100),
('ac-5', 'Viking Drinking Horn Mug', 'accessories', 'bags-pouches', 1800, NULL, '/images/drinking-horn.png', 'Solid ox-horn mug with flat base. Perfect for mead, ale, or just the aesthetic. Dishwasher safe.', '["mug", "horn", "viking"]', 1, 100)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `price` = VALUES(`price`);

SET FOREIGN_KEY_CHECKS = 1;
