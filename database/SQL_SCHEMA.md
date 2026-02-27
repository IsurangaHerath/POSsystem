# POS System - SQL Schema Scripts

This document contains all SQL scripts needed to create the database schema for the POS system.

---

## 1. Users Table

```sql
-- =============================================
-- POS System Database Schema
-- Table: users
-- Description: Store system users with role-based access
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') NOT NULL DEFAULT 'cashier',
    phone VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users COMMENT = 'System users with role-based access control';
```

---

## 2. Categories Table

```sql
-- =============================================
-- Table: categories
-- Description: Product categories with hierarchical support
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    parent_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key for self-referential hierarchy
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE categories COMMENT = 'Product categories with parent-child hierarchy';
```

---

## 3. Suppliers Table

```sql
-- =============================================
-- Table: suppliers
-- Description: Supplier information for procurement
-- =============================================

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    tax_id VARCHAR(50) NULL,
    payment_terms VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_suppliers_name (name),
    INDEX idx_suppliers_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE suppliers COMMENT = 'Supplier information for purchase orders';
```

---

## 4. Products Table

```sql
-- =============================================
-- Table: products
-- Description: Product catalog with pricing and stock info
-- =============================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    barcode VARCHAR(50) NULL UNIQUE,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category_id INT NULL,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'piece',
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_sku (sku),
    INDEX idx_products_category (category_id),
    INDEX idx_products_is_active (is_active),
    INDEX idx_products_stock (quantity_in_stock),
    FULLTEXT INDEX ft_products_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE products COMMENT = 'Product catalog with pricing and inventory';
```

---

## 5. Product Suppliers Table

```sql
-- =============================================
-- Table: product_suppliers
-- Description: Many-to-many relationship between products and suppliers
-- =============================================

CREATE TABLE IF NOT EXISTS product_suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    supplier_price DECIMAL(10,2) NULL,
    supplier_code VARCHAR(50) NULL,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_ps_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT uk_product_supplier UNIQUE (product_id, supplier_id),
    
    -- Indexes
    INDEX idx_ps_supplier (supplier_id),
    INDEX idx_ps_preferred (is_preferred)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE product_suppliers COMMENT = 'Product-supplier relationships';
```

---

## 6. Inventory Table

```sql
-- =============================================
-- Table: inventory
-- Description: Real-time inventory tracking per product
-- =============================================

CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    quantity_ordered INT NOT NULL DEFAULT 0,
    last_stock_check DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_inventory_available (quantity_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE inventory COMMENT = 'Real-time inventory tracking';
```

---

## 7. Sales Table

```sql
-- =============================================
-- Table: sales
-- Description: Sales transactions header
-- =============================================

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'mixed') NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    change_amount DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('completed', 'voided', 'refunded') DEFAULT 'completed',
    notes TEXT NULL,
    sale_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_sales_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_sales_invoice (invoice_number),
    INDEX idx_sales_user (user_id),
    INDEX idx_sales_date (sale_date),
    INDEX idx_sales_status (status),
    INDEX idx_sales_payment (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE sales COMMENT = 'Sales transaction records';
```

---

## 8. Sale Items Table

```sql
-- =============================================
-- Table: sale_items
-- Description: Individual items in each sale
-- =============================================

CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_barcode VARCHAR(50) NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_si_sale FOREIGN KEY (sale_id) 
        REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT fk_si_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_si_sale (sale_id),
    INDEX idx_si_product (product_id),
    INDEX idx_si_sale_product (sale_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE sale_items COMMENT = 'Line items for each sale transaction';
```

---

## 9. Purchase Orders Table

```sql
-- =============================================
-- Table: purchase_orders
-- Description: Purchase orders to suppliers
-- =============================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    user_id INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'approved', 'received', 'cancelled') DEFAULT 'pending',
    order_date DATE NOT NULL,
    expected_date DATE NULL,
    received_date DATE NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_po_number (po_number),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_user (user_id),
    INDEX idx_po_status (status),
    INDEX idx_po_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE purchase_orders COMMENT = 'Purchase order records';
```

---

## 10. Purchase Order Items Table

```sql
-- =============================================
-- Table: purchase_order_items
-- Description: Items in each purchase order
-- =============================================

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_poi_po FOREIGN KEY (purchase_order_id) 
        REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_poi_po (purchase_order_id),
    INDEX idx_poi_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE purchase_order_items COMMENT = 'Line items for purchase orders';
```

---

## 11. Inventory Logs Table

```sql
-- =============================================
-- Table: inventory_logs
-- Description: Audit trail for all inventory changes
-- =============================================

CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('sale', 'purchase', 'adjustment', 'return') NOT NULL,
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(50) NULL,
    user_id INT NOT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_il_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_il_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_il_product (product_id),
    INDEX idx_il_type (transaction_type),
    INDEX idx_il_reference (reference_id, reference_type),
    INDEX idx_il_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE inventory_logs COMMENT = 'Inventory change audit trail';
```

---

## 12. Settings Table

```sql
-- =============================================
-- Table: settings
-- Description: System configuration settings
-- =============================================

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_type VARCHAR(20) DEFAULT 'string',
    description VARCHAR(255) NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index
    INDEX idx_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE settings COMMENT = 'System configuration settings';
```

---

## 13. Audit Logs Table

```sql
-- =============================================
-- Table: audit_logs
-- Description: System-wide audit trail
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_al_user (user_id),
    INDEX idx_al_action (action),
    INDEX idx_al_entity (entity_type, entity_id),
    INDEX idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE audit_logs COMMENT = 'System-wide audit trail for all changes';
```

---

## 14. Triggers

### 14.1 Update Product Stock on Sale

```sql
-- =============================================
-- Trigger: after_sale_item_insert
-- Description: Decrease product stock when sale item is added
-- =============================================

DELIMITER //

CREATE TRIGGER after_sale_item_insert
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    -- Update product stock
    UPDATE products 
    SET quantity_in_stock = quantity_in_stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Update inventory
    UPDATE inventory 
    SET quantity_available = quantity_available - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
    
    -- Log the inventory change
    INSERT INTO inventory_logs (
        product_id, transaction_type, quantity_change, 
        quantity_before, quantity_after, reference_id, 
        reference_type, user_id, notes
    )
    SELECT 
        NEW.product_id,
        'sale',
        -NEW.quantity,
        p.quantity_in_stock + NEW.quantity,
        p.quantity_in_stock,
        NEW.sale_id,
        'sale',
        s.user_id,
        CONCAT('Sale item #', NEW.id)
    FROM products p
    JOIN sales s ON s.id = NEW.sale_id
    WHERE p.id = NEW.product_id;
END//

DELIMITER ;
```

### 14.2 Update Product Stock on Purchase Order Receipt

```sql
-- =============================================
-- Trigger: after_poi_update
-- Description: Increase product stock when PO item is received
-- =============================================

DELIMITER //

CREATE TRIGGER after_poi_update
AFTER UPDATE ON purchase_order_items
FOR EACH ROW
BEGIN
    DECLARE qty_diff INT;
    SET qty_diff = NEW.quantity_received - OLD.quantity_received;
    
    IF qty_diff > 0 THEN
        -- Update product stock
        UPDATE products 
        SET quantity_in_stock = quantity_in_stock + qty_diff
        WHERE id = NEW.product_id;
        
        -- Update inventory
        UPDATE inventory 
        SET quantity_available = quantity_available + qty_diff,
                quantity_ordered = quantity_ordered - qty_diff,
                updated_at = CURRENT_TIMESTAMP
        WHERE product_id = NEW.product_id;
        
        -- Log the inventory change
        INSERT INTO inventory_logs (
            product_id, transaction_type, quantity_change, 
            quantity_before, quantity_after, reference_id, 
            reference_type, user_id, notes
        )
        SELECT 
            NEW.product_id,
            'purchase',
            qty_diff,
            p.quantity_in_stock - qty_diff,
            p.quantity_in_stock,
            NEW.purchase_order_id,
            'purchase_order',
            po.user_id,
            CONCAT('PO #', po.po_number, ' receipt')
        FROM products p
        JOIN purchase_orders po ON po.id = NEW.purchase_order_id
        WHERE p.id = NEW.product_id;
    END IF;
END//

DELIMITER ;
```

---

## 15. Stored Procedures

### 15.1 Generate Invoice Number

```sql
-- =============================================
-- Procedure: generate_invoice_number
-- Description: Generate unique invoice number
-- =============================================

DELIMITER //

CREATE PROCEDURE generate_invoice_number(OUT p_invoice_number VARCHAR(50))
BEGIN
    DECLARE v_date_part VARCHAR(8);
    DECLARE v_sequence INT;
    
    -- Get date part (YYYYMMDD)
    SET v_date_part = DATE_FORMAT(CURRENT_DATE, '%Y%m%d');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, 10) AS UNSIGNED)), 0) + 1
    INTO v_sequence
    FROM sales
    WHERE invoice_number LIKE CONCAT('INV', v_date_part, '%');
    
    -- Generate invoice number
    SET p_invoice_number = CONCAT('INV', v_date_part, LPAD(v_sequence, 4, '0'));
END//

DELIMITER ;
```

### 15.2 Generate Purchase Order Number

```sql
-- =============================================
-- Procedure: generate_po_number
-- Description: Generate unique purchase order number
-- =============================================

DELIMITER //

CREATE PROCEDURE generate_po_number(OUT p_po_number VARCHAR(50))
BEGIN
    DECLARE v_date_part VARCHAR(8);
    DECLARE v_sequence INT;
    
    -- Get date part (YYYYMMDD)
    SET v_date_part = DATE_FORMAT(CURRENT_DATE, '%Y%m%d');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(po_number, 10) AS UNSIGNED)), 0) + 1
    INTO v_sequence
    FROM purchase_orders
    WHERE po_number LIKE CONCAT('PO', v_date_part, '%');
    
    -- Generate PO number
    SET p_po_number = CONCAT('PO', v_date_part, LPAD(v_sequence, 4, '0'));
END//

DELIMITER ;
```

### 15.3 Get Dashboard Statistics

```sql
-- =============================================
-- Procedure: get_dashboard_stats
-- Description: Get dashboard summary statistics
-- =============================================

DELIMITER //

CREATE PROCEDURE get_dashboard_stats(IN p_date DATE)
BEGIN
    -- Today's sales
    SELECT 
        COUNT(*) AS total_transactions,
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) AS cash_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END), 0) AS card_sales
    FROM sales
    WHERE DATE(sale_date) = p_date
    AND status = 'completed';
    
    -- Monthly sales
    SELECT 
        COUNT(*) AS total_transactions,
        COALESCE(SUM(total_amount), 0) AS total_sales
    FROM sales
    WHERE YEAR(sale_date) = YEAR(p_date)
    AND MONTH(sale_date) = MONTH(p_date)
    AND status = 'completed';
    
    -- Low stock products
    SELECT 
        p.id, p.name, p.barcode, p.quantity_in_stock, p.reorder_level
    FROM products p
    WHERE p.quantity_in_stock <= p.reorder_level
    AND p.is_active = TRUE
    ORDER BY p.quantity_in_stock ASC
    LIMIT 10;
    
    -- Top selling products (current month)
    SELECT 
        p.id, p.name, p.barcode,
        SUM(si.quantity) AS total_quantity,
        SUM(si.subtotal) AS total_revenue
    FROM sale_items si
    JOIN products p ON p.id = si.product_id
    JOIN sales s ON s.id = si.sale_id
    WHERE YEAR(s.sale_date) = YEAR(p_date)
    AND MONTH(s.sale_date) = MONTH(p_date)
    AND s.status = 'completed'
    GROUP BY p.id, p.name, p.barcode
    ORDER BY total_quantity DESC
    LIMIT 10;
END//

DELIMITER ;
```

---

## 16. Views

### 16.1 Product Inventory View

```sql
-- =============================================
-- View: vw_product_inventory
-- Description: Combined product and inventory data
-- =============================================

CREATE OR REPLACE VIEW vw_product_inventory AS
SELECT 
    p.id,
    p.name,
    p.barcode,
    p.sku,
    p.category_id,
    c.name AS category_name,
    p.cost_price,
    p.selling_price,
    p.quantity_in_stock,
    p.reorder_level,
    p.unit,
    p.tax_rate,
    p.is_active,
    COALESCE(i.quantity_available, p.quantity_in_stock) AS available,
    COALESCE(i.quantity_reserved, 0) AS reserved,
    COALESCE(i.quantity_ordered, 0) AS on_order,
    CASE 
        WHEN p.quantity_in_stock <= 0 THEN 'out_of_stock'
        WHEN p.quantity_in_stock <= p.reorder_level THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN inventory i ON i.product_id = p.id;
```

### 16.2 Sales Summary View

```sql
-- =============================================
-- View: vw_sales_summary
-- Description: Sales summary with user and item count
-- =============================================

CREATE OR REPLACE VIEW vw_sales_summary AS
SELECT 
    s.id,
    s.invoice_number,
    s.user_id,
    u.full_name AS cashier_name,
    s.subtotal,
    s.tax_amount,
    s.discount_amount,
    s.total_amount,
    s.payment_method,
    s.status,
    s.sale_date,
    COUNT(si.id) AS item_count,
    SUM(si.quantity) AS total_items
FROM sales s
JOIN users u ON u.id = s.user_id
LEFT JOIN sale_items si ON si.sale_id = s.id
GROUP BY s.id;
```

---

## 17. Default Settings Data

```sql
-- =============================================
-- Default system settings
-- =============================================

INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'POS System Store', 'string', 'Company name for receipts'),
('company_address', '123 Main Street, City', 'string', 'Company address'),
('company_phone', '+1-234-567-8900', 'string', 'Company phone number'),
('company_email', 'store@example.com', 'string', 'Company email'),
('tax_rate', '10.00', 'number', 'Default tax rate percentage'),
('currency_symbol', '$', 'string', 'Currency symbol'),
('currency_code', 'USD', 'string', 'Currency code'),
('receipt_footer', 'Thank you for your purchase!', 'string', 'Receipt footer message'),
('low_stock_threshold', '10', 'number', 'Default low stock threshold'),
('invoice_prefix', 'INV', 'string', 'Invoice number prefix'),
('po_prefix', 'PO', 'string', 'Purchase order number prefix');
```

---

## 18. Create Complete Database Script

```sql
-- =============================================
-- Complete Database Creation Script
-- Run this to create the entire database
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS pos_system 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE pos_system;

-- Then run all the CREATE TABLE statements above in order:
-- 1. users
-- 2. categories
-- 3. suppliers
-- 4. products
-- 5. product_suppliers
-- 6. inventory
-- 7. sales
-- 8. sale_items
-- 9. purchase_orders
-- 10. purchase_order_items
-- 11. inventory_logs
-- 12. settings
-- 13. audit_logs

-- Then create triggers, stored procedures, and views
-- Finally, insert default settings
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
