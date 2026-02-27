# POS System - Seed Data Scripts

This document contains sample seed data for testing and development purposes.

---

## 1. Users Seed Data

```sql
-- =============================================
-- Seed Data: Users
-- Password for all users: "password123" (bcrypt hashed)
-- =============================================

INSERT INTO users (username, email, password_hash, full_name, role, phone, is_active) VALUES
-- Admin user
('admin', 'admin@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'System Administrator', 'admin', '+1-555-0100', TRUE),

-- Manager users
('manager1', 'manager1@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'John Smith', 'manager', '+1-555-0101', TRUE),
('manager2', 'manager2@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'Sarah Johnson', 'manager', '+1-555-0102', TRUE),

-- Cashier users
('cashier1', 'cashier1@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'Mike Wilson', 'cashier', '+1-555-0201', TRUE),
('cashier2', 'cashier2@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'Emily Davis', 'cashier', '+1-555-0202', TRUE),
('cashier3', 'cashier3@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'James Brown', 'cashier', '+1-555-0203', TRUE),
('cashier4', 'cashier4@pos-system.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qO.1BoWBPfGKWe', 'Lisa Anderson', 'cashier', '+1-555-0204', TRUE);

-- Note: The password hash above is for "password123"
-- To generate new hashes, use: bcrypt.hash('password123', 12)
```

---

## 2. Categories Seed Data

```sql
-- =============================================
-- Seed Data: Categories
-- Hierarchical product categories
-- =============================================

-- Parent categories
INSERT INTO categories (name, description, parent_id, is_active) VALUES
('Electronics', 'Electronic devices and accessories', NULL, TRUE),
('Food & Beverages', 'Food items and drinks', NULL, TRUE),
('Household', 'Home and kitchen items', NULL, TRUE),
('Personal Care', 'Personal hygiene and beauty products', NULL, TRUE),
('Stationery', 'Office and school supplies', NULL, TRUE),
('Clothing', 'Apparel and accessories', NULL, TRUE);

-- Get category IDs for subcategories
SET @electronics = (SELECT id FROM categories WHERE name = 'Electronics');
SET @food = (SELECT id FROM categories WHERE name = 'Food & Beverages');
SET @household = (SELECT id FROM categories WHERE name = 'Household');
SET @personal = (SELECT id FROM categories WHERE name = 'Personal Care');
SET @stationery = (SELECT id FROM categories WHERE name = 'Stationery');
SET @clothing = (SELECT id FROM categories WHERE name = 'Clothing');

-- Subcategories
INSERT INTO categories (name, description, parent_id, is_active) VALUES
-- Electronics subcategories
('Mobile Phones', 'Smartphones and feature phones', @electronics, TRUE),
('Laptops & Computers', 'Laptops, desktops and peripherals', @electronics, TRUE),
('Audio & Video', 'Speakers, headphones, and video equipment', @electronics, TRUE),
('Accessories', 'Cables, chargers, and cases', @electronics, TRUE),

-- Food & Beverages subcategories
('Snacks', 'Chips, cookies, and packaged snacks', @food, TRUE),
('Beverages', 'Drinks and beverages', @food, TRUE),
('Dairy', 'Milk, cheese, and dairy products', @food, TRUE),
('Frozen Foods', 'Frozen meals and ice cream', @food, TRUE),

-- Household subcategories
('Kitchen', 'Kitchen utensils and appliances', @household, TRUE),
('Cleaning', 'Cleaning supplies and detergents', @household, TRUE),
('Storage', 'Containers and organizers', @household, TRUE),

-- Personal Care subcategories
('Skincare', 'Skin care products', @personal, TRUE),
('Haircare', 'Hair care products', @personal, TRUE),
('Oral Care', 'Toothpaste and oral hygiene', @personal, TRUE),

-- Stationery subcategories
('Writing', 'Pens, pencils, and markers', @stationery, TRUE),
('Paper', 'Notebooks and paper products', @stationery, TRUE),
('Office Supplies', 'Staplers, clips, and organizers', @stationery, TRUE),

-- Clothing subcategories
('Mens Wear', 'Men clothing and accessories', @clothing, TRUE),
('Womens Wear', 'Women clothing and accessories', @clothing, TRUE),
('Kids Wear', 'Children clothing', @clothing, TRUE);
```

---

## 3. Suppliers Seed Data

```sql
-- =============================================
-- Seed Data: Suppliers
-- Sample supplier information
-- =============================================

INSERT INTO suppliers (name, contact_person, phone, email, address, city, tax_id, payment_terms, is_active) VALUES
('TechSupply Co.', 'Robert Chen', '+1-555-1001', 'robert@techsupply.com', '100 Tech Boulevard, Suite 500', 'San Francisco', 'TAX-001234', 'Net 30', TRUE),
('Global Foods Inc.', 'Maria Garcia', '+1-555-1002', 'maria@globalfoods.com', '250 Food Court Drive', 'Los Angeles', 'TAX-002345', 'Net 15', TRUE),
('Home Essentials Ltd.', 'David Kim', '+1-555-1003', 'david@homeessentials.com', '75 Home Street', 'Chicago', 'TAX-003456', 'Net 30', TRUE),
('Beauty World Corp.', 'Jennifer Lee', '+1-555-1004', 'jennifer@beautyworld.com', '300 Beauty Lane', 'Miami', 'TAX-004567', 'Net 45', TRUE),
('Office Pro Supplies', 'Michael Brown', '+1-555-1005', 'michael@officepro.com', '200 Business Park Way', 'Seattle', 'TAX-005678', 'Net 30', TRUE),
('Fashion Forward LLC', 'Amanda White', '+1-555-1006', 'amanda@fashionforward.com', '150 Style Avenue', 'New York', 'TAX-006789', 'Net 60', TRUE),
('Fresh Dairy Farms', 'Thomas Anderson', '+1-555-1007', 'thomas@freshdairy.com', '50 Farm Road', 'Denver', 'TAX-007890', 'Net 7', TRUE),
('Snack Masters Inc.', 'Lisa Thompson', '+1-555-1008', 'lisa@snackmasters.com', '125 Snack Street', 'Boston', 'TAX-008901', 'Net 15', TRUE);
```

---

## 4. Products Seed Data

```sql
-- =============================================
-- Seed Data: Products
-- Sample product catalog
-- =============================================

-- Get category IDs
SET @mobile = (SELECT id FROM categories WHERE name = 'Mobile Phones');
SET @laptops = (SELECT id FROM categories WHERE name = 'Laptops & Computers');
SET @audio = (SELECT id FROM categories WHERE name = 'Audio & Video');
SET @accessories = (SELECT id FROM categories WHERE name = 'Accessories');
SET @snacks = (SELECT id FROM categories WHERE name = 'Snacks');
SET @beverages = (SELECT id FROM categories WHERE name = 'Beverages');
SET @dairy = (SELECT id FROM categories WHERE name = 'Dairy');
SET @frozen = (SELECT id FROM categories WHERE name = 'Frozen Foods');
SET @kitchen = (SELECT id FROM categories WHERE name = 'Kitchen');
SET @cleaning = (SELECT id FROM categories WHERE name = 'Cleaning');
SET @skincare = (SELECT id FROM categories WHERE name = 'Skincare');
SET @haircare = (SELECT id FROM categories WHERE name = 'Haircare');
SET @writing = (SELECT id FROM categories WHERE name = 'Writing');
SET @paper = (SELECT id FROM categories WHERE name = 'Paper');
SET @mens = (SELECT id FROM categories WHERE name = 'Mens Wear');
SET @womens = (SELECT id FROM categories WHERE name = 'Womens Wear');

INSERT INTO products (name, barcode, sku, category_id, cost_price, selling_price, quantity_in_stock, reorder_level, unit, description, tax_rate, is_active) VALUES
-- Electronics - Mobile Phones
('iPhone 15 Pro 128GB', '8901234567890', 'IPH15P128', @mobile, 899.00, 1099.00, 25, 5, 'piece', 'Apple iPhone 15 Pro 128GB Storage', 10.00, TRUE),
('Samsung Galaxy S24 256GB', '8901234567891', 'SAMGS24256', @mobile, 749.00, 949.00, 30, 5, 'piece', 'Samsung Galaxy S24 256GB Storage', 10.00, TRUE),
('Google Pixel 8 128GB', '8901234567892', 'GOOGPX8128', @mobile, 549.00, 699.00, 20, 5, 'piece', 'Google Pixel 8 128GB Storage', 10.00, TRUE),

-- Electronics - Laptops
('MacBook Air M3 256GB', '8901234567893', 'MACAM3256', @laptops, 999.00, 1299.00, 15, 3, 'piece', 'Apple MacBook Air M3 Chip 256GB', 10.00, TRUE),
('Dell XPS 15 Laptop', '8901234567894', 'DELLXPS15', @laptops, 1199.00, 1499.00, 10, 3, 'piece', 'Dell XPS 15 Intel i7 16GB RAM', 10.00, TRUE),
('HP Pavilion 15 Laptop', '8901234567895', 'HPPAV15', @laptops, 549.00, 749.00, 20, 5, 'piece', 'HP Pavilion 15 Intel i5 8GB RAM', 10.00, TRUE),

-- Electronics - Audio
('AirPods Pro 2nd Gen', '8901234567896', 'AIRPP2', @audio, 199.00, 249.00, 50, 10, 'piece', 'Apple AirPods Pro 2nd Generation', 10.00, TRUE),
('Sony WH-1000XM5 Headphones', '8901234567897', 'SONYWHXM5', @audio, 299.00, 399.00, 25, 5, 'piece', 'Sony Wireless Noise Cancelling Headphones', 10.00, TRUE),
('JBL Flip 6 Speaker', '8901234567898', 'JBLFLIP6', @audio, 79.00, 129.00, 40, 10, 'piece', 'JBL Portable Bluetooth Speaker', 10.00, TRUE),

-- Electronics - Accessories
('iPhone Charger Cable 2m', '8901234567899', 'IPHCBL2M', @accessories, 9.00, 19.00, 100, 20, 'piece', 'Lightning to USB Cable 2 meters', 10.00, TRUE),
('USB-C Fast Charger 65W', '8901234567900', 'USBC65W', @accessories, 19.00, 39.00, 75, 15, 'piece', 'USB-C PD Fast Charger 65W', 10.00, TRUE),
('Phone Case Universal', '8901234567901', 'PHONECASE', @accessories, 5.00, 15.00, 150, 30, 'piece', 'Universal Phone Case', 10.00, TRUE),

-- Food & Beverages - Snacks
('Potato Chips Classic 150g', '8901234567902', 'CHIPCL150', @snacks, 1.50, 3.00, 200, 50, 'piece', 'Classic Salted Potato Chips 150g', 0.00, TRUE),
('Chocolate Bar Milk 100g', '8901234567903', 'CHOCMLK100', @snacks, 1.00, 2.50, 150, 40, 'piece', 'Milk Chocolate Bar 100g', 0.00, TRUE),
('Cookies Assorted 200g', '8901234567904', 'COOKASS200', @snacks, 2.00, 4.00, 120, 30, 'piece', 'Assorted Cookies Pack 200g', 0.00, TRUE),
('Nuts Mixed 250g', '8901234567905', 'NUTSMIX250', @snacks, 3.50, 6.00, 80, 20, 'piece', 'Mixed Nuts 250g Pack', 0.00, TRUE),

-- Food & Beverages - Beverages
('Mineral Water 500ml', '8901234567906', 'WATER500', @beverages, 0.30, 1.00, 300, 100, 'piece', 'Mineral Water Bottle 500ml', 0.00, TRUE),
('Cola Soft Drink 330ml', '8901234567907', 'COLA330', @beverages, 0.50, 1.50, 250, 75, 'piece', 'Cola Flavored Soft Drink 330ml Can', 0.00, TRUE),
('Orange Juice 1L', '8901234567908', 'OJUICE1L', @beverages, 1.50, 3.50, 100, 25, 'piece', 'Fresh Orange Juice 1 Liter', 0.00, TRUE),
('Energy Drink 250ml', '8901234567909', 'ENERGY250', @beverages, 1.00, 2.50, 150, 40, 'piece', 'Energy Drink 250ml Can', 0.00, TRUE),

-- Food & Beverages - Dairy
('Fresh Milk 1L', '8901234567910', 'MILK1L', @dairy, 1.00, 2.00, 80, 20, 'piece', 'Fresh Whole Milk 1 Liter', 0.00, TRUE),
('Greek Yogurt 500g', '8901234567911', 'YOGURT500', @dairy, 2.00, 4.00, 60, 15, 'piece', 'Greek Yogurt 500g', 0.00, TRUE),
('Cheddar Cheese 200g', '8901234567912', 'CHEESE200', @dairy, 3.00, 5.50, 50, 15, 'piece', 'Cheddar Cheese Block 200g', 0.00, TRUE),

-- Food & Beverages - Frozen
('Ice Cream Vanilla 1L', '8901234567913', 'ICEVAN1L', @frozen, 3.00, 6.00, 40, 10, 'piece', 'Vanilla Ice Cream 1 Liter Tub', 0.00, TRUE),
('Frozen Pizza Medium', '8901234567914', 'PIZZAMED', @frozen, 4.00, 8.00, 30, 10, 'piece', 'Frozen Pizza Medium Size', 0.00, TRUE),

-- Household - Kitchen
('Non-Stick Frying Pan 28cm', '8901234567915', 'PANNS28', @kitchen, 12.00, 25.00, 35, 10, 'piece', 'Non-Stick Frying Pan 28cm', 10.00, TRUE),
('Stainless Steel Pot 5L', '8901234567916', 'POTSS5L', @kitchen, 15.00, 30.00, 25, 8, 'piece', 'Stainless Steel Cooking Pot 5L', 10.00, TRUE),
('Kitchen Knife Set 5pc', '8901234567917', 'KNIFESET5', @kitchen, 20.00, 45.00, 20, 5, 'piece', '5 Piece Kitchen Knife Set', 10.00, TRUE),

-- Household - Cleaning
('Dishwashing Liquid 500ml', '8901234567918', 'DISH500', @cleaning, 1.50, 3.50, 100, 30, 'piece', 'Dishwashing Liquid 500ml', 0.00, TRUE),
('All Purpose Cleaner 1L', '8901234567919', 'CLEAN1L', @cleaning, 2.00, 4.50, 80, 20, 'piece', 'All Purpose Surface Cleaner 1L', 0.00, TRUE),
('Paper Towels 6 Rolls', '8901234567920', 'PAPER6R', @cleaning, 5.00, 10.00, 60, 15, 'piece', 'Paper Towels Pack of 6 Rolls', 0.00, TRUE),

-- Personal Care - Skincare
('Face Moisturizer 50ml', '8901234567921', 'MOIST50', @skincare, 8.00, 18.00, 45, 15, 'piece', 'Daily Face Moisturizer 50ml', 10.00, TRUE),
('Sunscreen SPF50 100ml', '8901234567922', 'SUN50100', @skincare, 10.00, 22.00, 40, 10, 'piece', 'Sunscreen Lotion SPF50 100ml', 10.00, TRUE),
('Face Wash 150ml', '8901234567923', 'FWASH150', @skincare, 5.00, 12.00, 55, 15, 'piece', 'Gentle Face Wash 150ml', 10.00, TRUE),

-- Personal Care - Haircare
('Shampoo 400ml', '8901234567924', 'SHMP400', @haircare, 4.00, 9.00, 70, 20, 'piece', 'Daily Shampoo 400ml', 10.00, TRUE),
('Conditioner 400ml', '8901234567925', 'COND400', @haircare, 4.00, 9.00, 65, 20, 'piece', 'Hair Conditioner 400ml', 10.00, TRUE),
('Hair Gel 150ml', '8901234567926', 'HGEL150', @haircare, 3.00, 7.00, 50, 15, 'piece', 'Styling Hair Gel 150ml', 10.00, TRUE),

-- Stationery - Writing
('Ballpoint Pens 12 Pack', '8901234567927', 'BPEN12', @writing, 2.00, 5.00, 100, 30, 'piece', 'Ballpoint Pens Pack of 12', 0.00, TRUE),
('Gel Pens Set 6 Colors', '8901234567928', 'GELSET6', @writing, 3.00, 7.00, 80, 20, 'piece', 'Gel Pens Set 6 Colors', 0.00, TRUE),
('Permanent Markers 4 Pack', '8901234567929', 'MARK4', @writing, 2.50, 6.00, 70, 20, 'piece', 'Permanent Markers Pack of 4', 0.00, TRUE),

-- Stationery - Paper
('A4 Notebook 200 Pages', '8901234567930', 'NOTE200', @paper, 2.00, 5.00, 120, 30, 'piece', 'A4 Spiral Notebook 200 Pages', 0.00, TRUE),
('Sticky Notes Pack', '8901234567931', 'STICKYPK', @paper, 1.50, 4.00, 90, 25, 'piece', 'Sticky Notes Assorted Colors', 0.00, TRUE),
('Printer Paper A4 500 Sheets', '8901234567932', 'PAPER500', @paper, 4.00, 8.00, 50, 15, 'piece', 'A4 Printer Paper 500 Sheets', 0.00, TRUE),

-- Clothing - Mens
('Mens Cotton T-Shirt', '8901234567933', 'MTSHIRT', @mens, 8.00, 20.00, 60, 15, 'piece', 'Mens Cotton T-Shirt Various Sizes', 10.00, TRUE),
('Mens Jeans Classic Fit', '8901234567934', 'MJEANS', @mens, 15.00, 40.00, 40, 10, 'piece', 'Mens Classic Fit Jeans', 10.00, TRUE),

-- Clothing - Womens
('Womens Blouse', '8901234567935', 'WBLSE', @womens, 12.00, 30.00, 50, 15, 'piece', 'Womens Casual Blouse', 10.00, TRUE),
('Womens Dress Casual', '8901234567936', 'WDRESS', @womens, 20.00, 50.00, 35, 10, 'piece', 'Womens Casual Dress', 10.00, TRUE);
```

---

## 5. Product Suppliers Seed Data

```sql
-- =============================================
-- Seed Data: Product Suppliers
-- Links products to their suppliers
-- =============================================

INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    s.id,
    p.cost_price * 0.95, -- Slightly lower than our cost
    CONCAT('SUP-', p.sku),
    TRUE
FROM products p
CROSS JOIN suppliers s
WHERE s.name = 'TechSupply Co.' AND p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Electronics'))
LIMIT 20;

-- Link food products to Global Foods
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    (SELECT id FROM suppliers WHERE name = 'Global Foods Inc.'),
    p.cost_price * 0.90,
    CONCAT('GF-', p.sku),
    TRUE
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Food & Beverages'));

-- Link household products to Home Essentials
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    (SELECT id FROM suppliers WHERE name = 'Home Essentials Ltd.'),
    p.cost_price * 0.92,
    CONCAT('HE-', p.sku),
    TRUE
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Household'));

-- Link personal care to Beauty World
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    (SELECT id FROM suppliers WHERE name = 'Beauty World Corp.'),
    p.cost_price * 0.88,
    CONCAT('BW-', p.sku),
    TRUE
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Personal Care'));

-- Link stationery to Office Pro
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    (SELECT id FROM suppliers WHERE name = 'Office Pro Supplies'),
    p.cost_price * 0.90,
    CONCAT('OP-', p.sku),
    TRUE
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Stationery'));

-- Link clothing to Fashion Forward
INSERT INTO product_suppliers (product_id, supplier_id, supplier_price, supplier_code, is_preferred)
SELECT 
    p.id,
    (SELECT id FROM suppliers WHERE name = 'Fashion Forward LLC'),
    p.cost_price * 0.85,
    CONCAT('FF-', p.sku),
    TRUE
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE parent_id = (SELECT id FROM categories WHERE name = 'Clothing'));
```

---

## 6. Inventory Seed Data

```sql
-- =============================================
-- Seed Data: Inventory
-- Initialize inventory records for all products
-- =============================================

INSERT INTO inventory (product_id, quantity_available, quantity_reserved, quantity_ordered, last_stock_check)
SELECT 
    id,
    quantity_in_stock,
    0,
    0,
    CURRENT_TIMESTAMP
FROM products;
```

---

## 7. Sample Sales Data

```sql
-- =============================================
-- Seed Data: Sales
-- Sample sales transactions for testing
-- =============================================

-- Create sample sales for the past 30 days
-- Sale 1
INSERT INTO sales (invoice_number, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, sale_date)
VALUES ('INV202401150001', 4, 45.00, 4.50, 0.00, 49.50, 'cash', 50.00, 0.50, 'completed', '2024-01-15 10:30:00');

SET @sale1 = LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, product_id, product_name, product_barcode, unit_price, quantity, subtotal, discount, tax_amount)
VALUES 
(@sale1, (SELECT id FROM products WHERE sku = 'CHIPCL150'), 'Potato Chips Classic 150g', '8901234567902', 3.00, 5, 15.00, 0.00, 1.50),
(@sale1, (SELECT id FROM products WHERE sku = 'COLA330'), 'Cola Soft Drink 330ml', '8901234567907', 1.50, 10, 15.00, 0.00, 1.50),
(@sale1, (SELECT id FROM products WHERE sku = 'WATER500'), 'Mineral Water 500ml', '8901234567906', 1.00, 15, 15.00, 0.00, 1.50);

-- Sale 2
INSERT INTO sales (invoice_number, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, sale_date)
VALUES ('INV202401150002', 5, 249.00, 24.90, 0.00, 273.90, 'card', 273.90, 0.00, 'completed', '2024-01-15 11:45:00');

SET @sale2 = LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, product_id, product_name, product_barcode, unit_price, quantity, subtotal, discount, tax_amount)
VALUES 
(@sale2, (SELECT id FROM products WHERE sku = 'AIRPP2'), 'AirPods Pro 2nd Gen', '8901234567896', 249.00, 1, 249.00, 0.00, 24.90);

-- Sale 3
INSERT INTO sales (invoice_number, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, sale_date)
VALUES ('INV202401150003', 4, 89.50, 8.95, 5.00, 93.45, 'cash', 100.00, 6.55, 'completed', '2024-01-15 14:20:00');

SET @sale3 = LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, product_id, product_name, product_barcode, unit_price, quantity, subtotal, discount, tax_amount)
VALUES 
(@sale3, (SELECT id FROM products WHERE sku = 'SHMP400'), 'Shampoo 400ml', '8901234567924', 9.00, 2, 18.00, 0.00, 1.80),
(@sale3, (SELECT id FROM products WHERE sku = 'COND400'), 'Conditioner 400ml', '8901234567925', 9.00, 2, 18.00, 0.00, 1.80),
(@sale3, (SELECT id FROM products WHERE sku = 'MOIST50'), 'Face Moisturizer 50ml', '8901234567921', 18.00, 1, 18.00, 0.00, 1.80),
(@sale3, (SELECT id FROM products WHERE sku = 'FWASH150'), 'Face Wash 150ml', '8901234567923', 12.00, 1, 12.00, 0.00, 1.20),
(@sale3, (SELECT id FROM products WHERE sku = 'SUN50100'), 'Sunscreen SPF50 100ml', '8901234567922', 22.00, 1, 22.00, 0.00, 2.20);

-- Sale 4 - Mixed payment
INSERT INTO sales (invoice_number, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, sale_date)
VALUES ('INV202401160001', 6, 1299.00, 129.90, 0.00, 1428.90, 'mixed', 1428.90, 0.00, 'completed', '2024-01-16 09:15:00');

SET @sale4 = LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, product_id, product_name, product_barcode, unit_price, quantity, subtotal, discount, tax_amount)
VALUES 
(@sale4, (SELECT id FROM products WHERE sku = 'MACAM3256'), 'MacBook Air M3 256GB', '8901234567893', 1299.00, 1, 1299.00, 0.00, 129.90);

-- Sale 5
INSERT INTO sales (invoice_number, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_amount, status, sale_date)
VALUES ('INV202401160002', 4, 156.00, 15.60, 0.00, 171.60, 'card', 171.60, 0.00, 'completed', '2024-01-16 13:30:00');

SET @sale5 = LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, product_id, product_name, product_barcode, unit_price, quantity, subtotal, discount, tax_amount)
VALUES 
(@sale5, (SELECT id FROM products WHERE sku = 'JBLFLIP6'), 'JBL Flip 6 Speaker', '8901234567898', 129.00, 1, 129.00, 0.00, 12.90),
(@sale5, (SELECT id FROM products WHERE sku = 'USBC65W'), 'USB-C Fast Charger 65W', '8901234567900', 39.00, 1, 39.00, 0.00, 3.90);
```

---

## 8. Sample Purchase Orders

```sql
-- =============================================
-- Seed Data: Purchase Orders
-- Sample purchase orders for testing
-- =============================================

INSERT INTO purchase_orders (po_number, supplier_id, user_id, subtotal, tax_amount, total_amount, status, order_date, expected_date, notes)
VALUES 
('PO202401100001', (SELECT id FROM suppliers WHERE name = 'TechSupply Co.'), 2, 5000.00, 500.00, 5500.00, 'received', '2024-01-10', '2024-01-15', 'Quarterly electronics restock'),
('PO202401120001', (SELECT id FROM suppliers WHERE name = 'Global Foods Inc.'), 2, 2500.00, 0.00, 2500.00, 'approved', '2024-01-12', '2024-01-18', 'Weekly food supplies'),
('PO202401150001', (SELECT id FROM suppliers WHERE name = 'Home Essentials Ltd.'), 3, 1500.00, 150.00, 1650.00, 'pending', '2024-01-15', '2024-01-22', 'Household items order');

-- PO Items for received order
SET @po1 = (SELECT id FROM purchase_orders WHERE po_number = 'PO202401100001');

INSERT INTO purchase_order_items (purchase_order_id, product_id, unit_cost, quantity_ordered, quantity_received, subtotal)
VALUES 
(@po1, (SELECT id FROM products WHERE sku = 'IPH15P128'), 899.00, 5, 5, 4495.00),
(@po1, (SELECT id FROM products WHERE sku = 'IPHCBL2M'), 9.00, 50, 50, 450.00);

-- PO Items for approved order
SET @po2 = (SELECT id FROM purchase_orders WHERE po_number = 'PO202401120001');

INSERT INTO purchase_order_items (purchase_order_id, product_id, unit_cost, quantity_ordered, quantity_received, subtotal)
VALUES 
(@po2, (SELECT id FROM products WHERE sku = 'CHIPCL150'), 1.50, 500, 0, 750.00),
(@po2, (SELECT id FROM products WHERE sku = 'COLA330'), 0.50, 1000, 0, 500.00),
(@po2, (SELECT id FROM products WHERE sku = 'WATER500'), 0.30, 2000, 0, 600.00),
(@po2, (SELECT id FROM products WHERE sku = 'ENERGY250'), 1.00, 650, 0, 650.00);
```

---

## 9. Complete Seed Script

```sql
-- =============================================
-- Complete Seed Data Script
-- Run this after creating all tables
-- =============================================

-- 1. Insert users
-- 2. Insert categories
-- 3. Insert suppliers
-- 4. Insert products
-- 5. Insert product_suppliers
-- 6. Insert inventory
-- 7. Insert sample sales
-- 8. Insert sample purchase orders
-- 9. Insert default settings (from SQL_SCHEMA.md)

-- Note: Run each section in order to maintain foreign key relationships
```

---

## 10. Test Credentials

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | password123 | Admin | Full system access |
| manager1 | password123 | Manager | Limited admin access |
| manager2 | password123 | Manager | Limited admin access |
| cashier1 | password123 | Cashier | Sales operations |
| cashier2 | password123 | Cashier | Sales operations |
| cashier3 | password123 | Cashier | Sales operations |
| cashier4 | password123 | Cashier | Sales operations |

---

*Document Version: 1.0*
*Last Updated: February 2026*
