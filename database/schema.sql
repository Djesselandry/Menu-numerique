-- =====================================================
-- SCHEMA RESTAURANT - SYSTEME DE COMMANDE QR
-- MODE : 1 RESTAURANT = 1 INSTALLATION
-- =====================================================

-- -------------------------
-- TABLE : users (Admin authentication)
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- -------------------------
-- TABLE : tables
-- -------------------------
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  qr_code TEXT
);

-- -------------------------
-- TABLE : menu_items
-- -------------------------
CREATE TABLE IF NOT EXISTS menu (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- -------------------------
-- TABLE : orders
-- -------------------------
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  table_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_order_table
    FOREIGN KEY (table_id)
    REFERENCES tables(id),

  CONSTRAINT chk_order_status
    CHECK (status IN ('PENDING', 'PREPARING', 'SERVED', 'ARCHIVED'))
);

-- -------------------------
-- TABLE : order_items
-- -------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,

  CONSTRAINT fk_item_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_item_menu
    FOREIGN KEY (menu_id)
    REFERENCES menu(id)
);

-- -------------------------
-- TABLE : settings
-- -------------------------
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  sound_enabled BOOLEAN DEFAULT TRUE,
  offline_mode BOOLEAN DEFAULT TRUE,
  printer_enabled BOOLEAN DEFAULT FALSE
);

-- -------------------------
-- INDEXES (PERFORMANCE)
-- -------------------------
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created
  ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_menu_active
  ON menu(is_active);

-- -------------------------
-- INITIAL SETTINGS (OPTIONNEL MAIS RECOMMANDE)
-- -------------------------
INSERT INTO settings (sound_enabled, offline_mode, printer_enabled)
SELECT TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================
