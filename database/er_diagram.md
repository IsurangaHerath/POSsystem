# POS System - Database Schema Documentation

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SALES : creates
    USERS ||--o{ PURCHASE_ORDERS : manages
    USERS ||--o{ INVENTORY_LOGS : records
    
    CATEGORIES ||--o{ PRODUCTS : contains
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    
    PRODUCTS ||--o{ SALE_ITEMS : "included in"
    PRODUCTS ||--o{ INVENTORY : has
    PRODUCTS ||--o{ INVENTORY_LOGS : tracks
    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : "ordered in"
    
    SUPPLIERS ||--o{ PURCHASE_ORDERS : receives
    SUPPLIERS ||--o{ PRODUCT_SUPPLIERS : supplies
    PRODUCTS ||--o{ PRODUCT_SUPPLIERS : "supplied by"
    
    SALES ||--o{ SALE_ITEMS : contains
    
    PURCHASE_ORDERS ||--o{ PURCHASE_ORDER_ITEMS : contains
    PURCHASE_ORDERS ||--o{ INVENTORY_LOGS : generates
    
    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string full_name
        string role
        string phone
        boolean is_active
        datetime last_login
        datetime created_at
        datetime updated_at
    }
    
    CATEGORIES {
        int id PK
        string name UK
        string description
        int parent_id FK
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    PRODUCTS {
        int id PK
        string name
        string barcode UK
        string sku UK
        int category_id FK
        decimal cost_price
        decimal selling_price
        int quantity_in_stock
        int reorder_level
        string unit
        text description
        string image_url
        decimal tax_rate
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    SUPPLIERS {
        int id PK
        string name
        string contact_person
        string phone
        string email
        string address
        string city
        string tax_id
        string payment_terms
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT_SUPPLIERS {
        int id PK
        int product_id FK
        int supplier_id FK
        decimal supplier_price
        string supplier_code
        boolean is_preferred
        datetime created_at
    }
    
    INVENTORY {
        int id PK
        int product_id FK UK
        int quantity_available
        int quantity_reserved
        int quantity_ordered
        datetime last_stock_check
        datetime created_at
        datetime updated_at
    }
    
    SALES {
        int id PK
        string invoice_number UK
        int user_id FK
        decimal subtotal
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
        string payment_method
        decimal amount_paid
        decimal change_amount
        string status
        text notes
        datetime sale_date
        datetime created_at
        datetime updated_at
    }
    
    SALE_ITEMS {
        int id PK
        int sale_id FK
        int product_id FK
        string product_name
        string product_barcode
        decimal unit_price
        int quantity
        decimal subtotal
        decimal discount
        decimal tax_amount
        datetime created_at
    }
    
    PURCHASE_ORDERS {
        int id PK
        string po_number UK
        int supplier_id FK
        int user_id FK
        decimal subtotal
        decimal tax_amount
        decimal total_amount
        string status
        date order_date
        date expected_date
        date received_date
        text notes
        datetime created_at
        datetime updated_at
    }
    
    PURCHASE_ORDER_ITEMS {
        int id PK
        int purchase_order_id FK
        int product_id FK
        decimal unit_cost
        int quantity_ordered
        int quantity_received
        decimal subtotal
        datetime created_at
    }
    
    INVENTORY_LOGS {
        int id PK
        int product_id FK
        string transaction_type
        int quantity_change
        int quantity_before
        int quantity_after
        int reference_id
        string reference_type
        int user_id FK
        text notes
        datetime created_at
    }
    
    SETTINGS {
        int id PK
        string setting_key UK
        text setting_value
        string setting_type
        string description
        datetime updated_at
    }
    
    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        text old_values
        text new_values
        string ip_address
        string user_agent
        datetime created_at
    }
```

---

## Table Definitions

### 1. Users Table

**Purpose**: Store system users with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| role | ENUM | NOT NULL, DEFAULT 'cashier' | Role: admin, manager, cashier |
| phone | VARCHAR(20) | NULL | Contact phone number |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| last_login | DATETIME | NULL | Last login timestamp |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`
- UNIQUE INDEX on `email`
- INDEX on `role`
- INDEX on `is_active`

---

### 2. Categories Table

**Purpose**: Product categories with hierarchical support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| description | TEXT | NULL | Category description |
| parent_id | INT | FOREIGN KEY, NULL | Parent category for hierarchy |
| is_active | BOOLEAN | DEFAULT TRUE | Category status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `name`
- INDEX on `parent_id`
- INDEX on `is_active`

---

### 3. Products Table

**Purpose**: Product catalog with pricing and stock information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Product name |
| barcode | VARCHAR(50) | UNIQUE, NULL | Barcode for scanning |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Stock keeping unit |
| category_id | INT | FOREIGN KEY, NULL | Category reference |
| cost_price | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Purchase cost |
| selling_price | DECIMAL(10,2) | NOT NULL | Selling price |
| quantity_in_stock | INT | NOT NULL, DEFAULT 0 | Current stock level |
| reorder_level | INT | NOT NULL, DEFAULT 10 | Low stock threshold |
| unit | VARCHAR(20) | DEFAULT 'piece' | Unit of measurement |
| description | TEXT | NULL | Product description |
| image_url | VARCHAR(500) | NULL | Product image path |
| tax_rate | DECIMAL(5,2) | DEFAULT 0 | Tax percentage |
| is_active | BOOLEAN | DEFAULT TRUE | Product status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `barcode`
- UNIQUE INDEX on `sku`
- INDEX on `category_id`
- INDEX on `is_active`
- INDEX on `quantity_in_stock` (for low stock queries)
- FULLTEXT INDEX on `name`, `description` (for search)

---

### 4. Suppliers Table

**Purpose**: Supplier information for procurement.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Supplier name |
| contact_person | VARCHAR(100) | NULL | Contact person name |
| phone | VARCHAR(20) | NULL | Phone number |
| email | VARCHAR(100) | NULL | Email address |
| address | TEXT | NULL | Full address |
| city | VARCHAR(100) | NULL | City |
| tax_id | VARCHAR(50) | NULL | Tax identification |
| payment_terms | VARCHAR(100) | NULL | Payment terms |
| is_active | BOOLEAN | DEFAULT TRUE | Supplier status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `name`
- INDEX on `is_active`

---

### 5. Product_Suppliers Table

**Purpose**: Many-to-many relationship between products and suppliers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| product_id | INT | FOREIGN KEY, NOT NULL | Product reference |
| supplier_id | INT | FOREIGN KEY, NOT NULL | Supplier reference |
| supplier_price | DECIMAL(10,2) | NULL | Supplier's price |
| supplier_code | VARCHAR(50) | NULL | Supplier's product code |
| is_preferred | BOOLEAN | DEFAULT FALSE | Preferred supplier flag |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(product_id, supplier_id)`
- INDEX on `supplier_id`
- INDEX on `is_preferred`

---

### 6. Inventory Table

**Purpose**: Real-time inventory tracking per product.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| product_id | INT | FOREIGN KEY, UNIQUE, NOT NULL | Product reference |
| quantity_available | INT | NOT NULL, DEFAULT 0 | Available for sale |
| quantity_reserved | INT | NOT NULL, DEFAULT 0 | Reserved in carts |
| quantity_ordered | INT | NOT NULL, DEFAULT 0 | On purchase orders |
| last_stock_check | DATETIME | NULL | Last inventory check |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `product_id`
- INDEX on `quantity_available`

---

### 7. Sales Table

**Purpose**: Sales transactions header.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Invoice number |
| user_id | INT | FOREIGN KEY, NOT NULL | Cashier reference |
| subtotal | DECIMAL(12,2) | NOT NULL | Before tax/discount |
| tax_amount | DECIMAL(12,2) | DEFAULT 0 | Total tax |
| discount_amount | DECIMAL(12,2) | DEFAULT 0 | Total discount |
| total_amount | DECIMAL(12,2) | NOT NULL | Final total |
| payment_method | ENUM | NOT NULL | cash, card, mixed |
| amount_paid | DECIMAL(12,2) | NOT NULL | Amount received |
| change_amount | DECIMAL(12,2) | DEFAULT 0 | Change given |
| status | ENUM | DEFAULT 'completed' | completed, voided, refunded |
| notes | TEXT | NULL | Transaction notes |
| sale_date | DATETIME | NOT NULL | Date of sale |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `invoice_number`
- INDEX on `user_id`
- INDEX on `sale_date`
- INDEX on `status`
- INDEX on `payment_method`

---

### 8. Sale_Items Table

**Purpose**: Individual items in each sale.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| sale_id | INT | FOREIGN KEY, NOT NULL | Sale reference |
| product_id | INT | FOREIGN KEY, NULL | Product reference |
| product_name | VARCHAR(200) | NOT NULL | Snapshot of product name |
| product_barcode | VARCHAR(50) | NULL | Snapshot of barcode |
| unit_price | DECIMAL(10,2) | NOT NULL | Price at time of sale |
| quantity | INT | NOT NULL | Quantity sold |
| subtotal | DECIMAL(12,2) | NOT NULL | Line total |
| discount | DECIMAL(10,2) | DEFAULT 0 | Line discount |
| tax_amount | DECIMAL(10,2) | DEFAULT 0 | Line tax |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `sale_id`
- INDEX on `product_id`
- COMPOSITE INDEX on `(sale_id, product_id)`

---

### 9. Purchase_Orders Table

**Purpose**: Purchase orders to suppliers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| po_number | VARCHAR(50) | UNIQUE, NOT NULL | Purchase order number |
| supplier_id | INT | FOREIGN KEY, NOT NULL | Supplier reference |
| user_id | INT | FOREIGN KEY, NOT NULL | User who created |
| subtotal | DECIMAL(12,2) | NOT NULL | Before tax |
| tax_amount | DECIMAL(12,2) | DEFAULT 0 | Tax amount |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount |
| status | ENUM | DEFAULT 'pending' | pending, approved, received, cancelled |
| order_date | DATE | NOT NULL | Order date |
| expected_date | DATE | NULL | Expected delivery |
| received_date | DATE | NULL | Actual received date |
| notes | TEXT | NULL | Order notes |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `po_number`
- INDEX on `supplier_id`
- INDEX on `user_id`
- INDEX on `status`
- INDEX on `order_date`

---

### 10. Purchase_Order_Items Table

**Purpose**: Items in each purchase order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| purchase_order_id | INT | FOREIGN KEY, NOT NULL | PO reference |
| product_id | INT | FOREIGN KEY, NOT NULL | Product reference |
| unit_cost | DECIMAL(10,2) | NOT NULL | Cost per unit |
| quantity_ordered | INT | NOT NULL | Quantity ordered |
| quantity_received | INT | DEFAULT 0 | Quantity received |
| subtotal | DECIMAL(12,2) | NOT NULL | Line total |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `purchase_order_id`
- INDEX on `product_id`

---

### 11. Inventory_Logs Table

**Purpose**: Audit trail for all inventory changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| product_id | INT | FOREIGN KEY, NOT NULL | Product reference |
| transaction_type | ENUM | NOT NULL | sale, purchase, adjustment, return |
| quantity_change | INT | NOT NULL | +/- quantity |
| quantity_before | INT | NOT NULL | Stock before change |
| quantity_after | INT | NOT NULL | Stock after change |
| reference_id | INT | NULL | Related record ID |
| reference_type | VARCHAR(50) | NULL | sale, purchase_order, manual |
| user_id | INT | FOREIGN KEY, NOT NULL | User who made change |
| notes | TEXT | NULL | Additional notes |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `product_id`
- INDEX on `transaction_type`
- INDEX on `reference_id`, `reference_type`
- INDEX on `created_at`

---

### 12. Settings Table

**Purpose**: System configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Setting identifier |
| setting_value | TEXT | NULL | Setting value |
| setting_type | VARCHAR(20) | DEFAULT 'string' | string, number, boolean, json |
| description | VARCHAR(255) | NULL | Setting description |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `setting_key`

---

### 13. Audit_Logs Table

**Purpose**: System-wide audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY, NULL | User who performed action |
| action | VARCHAR(50) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Table/entity affected |
| entity_id | INT | NULL | Record ID affected |
| old_values | JSON | NULL | Previous values |
| new_values | JSON | NULL | New values |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | VARCHAR(255) | NULL | Browser/client info |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `action`
- INDEX on `entity_type`, `entity_id`
- INDEX on `created_at`

---

## Relationships Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| Users → Sales | One-to-Many | A user can create many sales |
| Users → Purchase_Orders | One-to-Many | A user can create many POs |
| Users → Inventory_Logs | One-to-Many | A user can create many logs |
| Categories → Products | One-to-Many | A category has many products |
| Categories → Categories | Self-Referential | Parent-child category hierarchy |
| Products → Sale_Items | One-to-Many | A product can be in many sales |
| Products → Inventory | One-to-One | Each product has one inventory record |
| Products → Inventory_Logs | One-to-Many | A product has many inventory logs |
| Products → Product_Suppliers | Many-to-Many | Products supplied by multiple suppliers |
| Suppliers → Purchase_Orders | One-to-Many | A supplier has many POs |
| Suppliers → Product_Suppliers | Many-to-Many | Suppliers supply multiple products |
| Sales → Sale_Items | One-to-Many | A sale has many items |
| Purchase_Orders → Purchase_Order_Items | One-to-Many | A PO has many items |
| Purchase_Orders → Inventory_Logs | One-to-Many | A PO generates inventory logs |

---

## Data Integrity Rules

### Foreign Key Constraints

1. **ON DELETE RESTRICT**: Prevent deletion of referenced records
   - Categories with products
   - Products with sale items
   - Users with sales

2. **ON DELETE SET NULL**: Allow deletion, set reference to null
   - Categories parent_id when parent deleted

3. **ON DELETE CASCADE**: Delete related records automatically
   - Sale items when sale deleted
   - Purchase order items when PO deleted

### Business Rules

1. Stock cannot go negative (trigger validation)
2. Invoice numbers are auto-generated and unique
3. PO numbers are auto-generated and unique
4. Soft delete for products (set is_active = false)
5. Audit log entries are immutable

---

## Performance Considerations

### Indexing Strategy

1. **Primary Keys**: All tables have auto-increment integer primary keys
2. **Foreign Keys**: Indexed for join performance
3. **Search Fields**: Full-text index on product name/description
4. **Date Fields**: Indexed for date-range queries
5. **Status Fields**: Indexed for filtering

### Query Optimization

1. Use covering indexes for frequent queries
2. Denormalize sale_items with product snapshot for historical accuracy
3. Partition large tables (sales, inventory_logs) by date for future scaling
4. Use stored procedures for complex operations

---

*Document Version: 1.0*
*Last Updated: February 2026*
