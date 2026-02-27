# POS System - API Documentation

Complete RESTful API documentation for the Point of Sale system.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#1-authentication-api)
   - [Users](#2-users-api)
   - [Products](#3-products-api)
   - [Categories](#4-categories-api)
   - [Sales](#5-sales-api)
   - [Inventory](#6-inventory-api)
   - [Suppliers](#7-suppliers-api)
   - [Purchase Orders](#8-purchase-orders-api)
   - [Reports](#9-reports-api)
   - [Dashboard](#10-dashboard-api)
   - [Settings](#11-settings-api)

---

## Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

### API Version
Current version: `v1`

### Content Type
All requests and responses use JSON format:
```
Content-Type: application/json
```

---

## Authentication

The API uses JWT (JSON Web Token) for authentication.

### Token Format
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Token Types
| Token Type | Expiry | Purpose |
|------------|--------|---------|
| Access Token | 15 minutes | API access |
| Refresh Token | 7 days | Token renewal |

### Getting a Token
Login via `/api/auth/login` to receive access and refresh tokens.

---

## Common Patterns

### Pagination
List endpoints support pagination with query parameters:

```
GET /api/products?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Sorting
Sort results with query parameters:
```
GET /api/products?sortBy=name&sortOrder=asc
```

### Filtering
Filter results with query parameters:
```
GET /api/products?category_id=1&is_active=true
```

### Search
Full-text search with query parameter:
```
GET /api/products?search=iphone
```

### Date Range
Filter by date range:
```
GET /api/sales?startDate=2024-01-01&endDate=2024-01-31
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

### Error Codes
| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| AUTHENTICATION_ERROR | Invalid or missing token |
| AUTHORIZATION_ERROR | Insufficient permissions |
| NOT_FOUND_ERROR | Resource not found |
| CONFLICT_ERROR | Resource conflict (e.g., duplicate) |
| DATABASE_ERROR | Database operation failed |
| INTERNAL_ERROR | Unexpected server error |

---

## API Endpoints

---

## 1. Authentication API

### 1.1 Login
Authenticate user and receive tokens.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@pos-system.com",
      "full_name": "System Administrator",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid username or password"
  }
}
```

---

### 1.2 Logout
Invalidate current session.

**Endpoint:** `POST /api/auth/logout`

**Access:** Authenticated

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 1.3 Refresh Token
Get new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Access:** Authenticated (refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.4 Get Current User
Get authenticated user profile.

**Endpoint:** `GET /api/auth/me`

**Access:** Authenticated

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@pos-system.com",
    "full_name": "System Administrator",
    "role": "admin",
    "phone": "+1-555-0100",
    "is_active": true,
    "last_login": "2024-01-15T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 1.5 Change Password
Change current user password.

**Endpoint:** `PUT /api/auth/password`

**Access:** Authenticated

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Users API

### 2.1 List Users
Get paginated list of users.

**Endpoint:** `GET /api/users`

**Access:** Admin only

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| role | string | - | Filter by role |
| is_active | boolean | - | Filter by status |
| search | string | - | Search in name, email, username |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@pos-system.com",
      "full_name": "System Administrator",
      "role": "admin",
      "phone": "+1-555-0100",
      "is_active": true,
      "last_login": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 7,
    "totalPages": 1
  }
}
```

---

### 2.2 Get User
Get single user by ID.

**Endpoint:** `GET /api/users/:id`

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@pos-system.com",
    "full_name": "System Administrator",
    "role": "admin",
    "phone": "+1-555-0100",
    "is_active": true,
    "last_login": "2024-01-15T10:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2.3 Create User
Create new user.

**Endpoint:** `POST /api/users`

**Access:** Admin only

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@pos-system.com",
  "password": "password123",
  "full_name": "New User",
  "role": "cashier",
  "phone": "+1-555-0300"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 8,
    "username": "newuser",
    "email": "newuser@pos-system.com",
    "full_name": "New User",
    "role": "cashier",
    "phone": "+1-555-0300",
    "is_active": true,
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### 2.4 Update User
Update user information.

**Endpoint:** `PUT /api/users/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "email": "updated@pos-system.com",
  "phone": "+1-555-0301",
  "role": "manager",
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 8,
    "username": "newuser",
    "email": "updated@pos-system.com",
    "full_name": "Updated Name",
    "role": "manager",
    "phone": "+1-555-0301",
    "is_active": true,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### 2.5 Delete User
Soft delete user (set is_active = false).

**Endpoint:** `DELETE /api/users/:id`

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## 3. Products API

### 3.1 List Products
Get paginated list of products.

**Endpoint:** `GET /api/products`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| category_id | int | - | Filter by category |
| is_active | boolean | - | Filter by status |
| low_stock | boolean | - | Filter low stock items |
| search | string | - | Search in name, barcode, SKU |
| sortBy | string | name | Sort field |
| sortOrder | string | asc | Sort order |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro 128GB",
      "barcode": "8901234567890",
      "sku": "IPH15P128",
      "category_id": 7,
      "category_name": "Mobile Phones",
      "cost_price": 899.00,
      "selling_price": 1099.00,
      "quantity_in_stock": 25,
      "reorder_level": 5,
      "unit": "piece",
      "tax_rate": 10.00,
      "is_active": true,
      "stock_status": "in_stock"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 3.2 Get Product
Get single product by ID.

**Endpoint:** `GET /api/products/:id`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro 128GB",
    "barcode": "8901234567890",
    "sku": "IPH15P128",
    "category_id": 7,
    "category": {
      "id": 7,
      "name": "Mobile Phones",
      "parent": {
        "id": 1,
        "name": "Electronics"
      }
    },
    "cost_price": 899.00,
    "selling_price": 1099.00,
    "quantity_in_stock": 25,
    "reorder_level": 5,
    "unit": "piece",
    "description": "Apple iPhone 15 Pro 128GB Storage",
    "image_url": null,
    "tax_rate": 10.00,
    "is_active": true,
    "inventory": {
      "quantity_available": 25,
      "quantity_reserved": 0,
      "quantity_ordered": 0
    },
    "suppliers": [
      {
        "id": 1,
        "name": "TechSupply Co.",
        "supplier_price": 850.00,
        "is_preferred": true
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 3.3 Get Product by Barcode
Find product by barcode.

**Endpoint:** `GET /api/products/barcode/:barcode`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro 128GB",
    "barcode": "8901234567890",
    "sku": "IPH15P128",
    "selling_price": 1099.00,
    "quantity_in_stock": 25,
    "tax_rate": 10.00
  }
}
```

---

### 3.4 Create Product
Create new product.

**Endpoint:** `POST /api/products`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "New Product Name",
  "barcode": "8901234567999",
  "sku": "NEWPROD001",
  "category_id": 7,
  "cost_price": 100.00,
  "selling_price": 150.00,
  "quantity_in_stock": 50,
  "reorder_level": 10,
  "unit": "piece",
  "description": "Product description",
  "tax_rate": 10.00
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 46,
    "name": "New Product Name",
    "barcode": "8901234567999",
    "sku": "NEWPROD001",
    "selling_price": 150.00,
    "quantity_in_stock": 50
  }
}
```

---

### 3.5 Update Product
Update product information.

**Endpoint:** `PUT /api/products/:id`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "selling_price": 160.00,
  "reorder_level": 15,
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 46,
    "name": "Updated Product Name",
    "selling_price": 160.00,
    "reorder_level": 15
  }
}
```

---

### 3.6 Delete Product
Soft delete product.

**Endpoint:** `DELETE /api/products/:id`

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Product deactivated successfully"
}
```

---

### 3.7 Get Low Stock Products
Get products below reorder level.

**Endpoint:** `GET /api/products/low-stock`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Dell XPS 15 Laptop",
      "barcode": "8901234567894",
      "sku": "DELLXPS15",
      "quantity_in_stock": 3,
      "reorder_level": 3,
      "stock_status": "low_stock"
    }
  ]
}
```

---

## 4. Categories API

### 4.1 List Categories
Get all categories in tree structure.

**Endpoint:** `GET /api/categories`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parent_id": null,
      "is_active": true,
      "children": [
        {
          "id": 7,
          "name": "Mobile Phones",
          "parent_id": 1,
          "is_active": true
        },
        {
          "id": 8,
          "name": "Laptops & Computers",
          "parent_id": 1,
          "is_active": true
        }
      ]
    }
  ]
}
```

---

### 4.2 Create Category
Create new category.

**Endpoint:** `POST /api/categories`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "parent_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 25,
    "name": "New Category",
    "parent_id": 1
  }
}
```

---

### 4.3 Update Category
Update category information.

**Endpoint:** `PUT /api/categories/:id`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated description"
}
```

---

### 4.4 Delete Category
Delete category (must have no products).

**Endpoint:** `DELETE /api/categories/:id`

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 5. Sales API

### 5.1 List Sales
Get paginated list of sales.

**Endpoint:** `GET /api/sales`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| startDate | date | - | Start date filter |
| endDate | date | - | End date filter |
| status | string | - | Filter by status |
| payment_method | string | - | Filter by payment method |
| user_id | int | - | Filter by cashier |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoice_number": "INV202401150001",
      "user_id": 4,
      "cashier_name": "Mike Wilson",
      "subtotal": 45.00,
      "tax_amount": 4.50,
      "discount_amount": 0.00,
      "total_amount": 49.50,
      "payment_method": "cash",
      "status": "completed",
      "sale_date": "2024-01-15T10:30:00Z",
      "item_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 5.2 Get Sale
Get sale details with items.

**Endpoint:** `GET /api/sales/:id`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_number": "INV202401150001",
    "user_id": 4,
    "cashier": {
      "id": 4,
      "name": "Mike Wilson"
    },
    "subtotal": 45.00,
    "tax_amount": 4.50,
    "discount_amount": 0.00,
    "total_amount": 49.50,
    "payment_method": "cash",
    "amount_paid": 50.00,
    "change_amount": 0.50,
    "status": "completed",
    "notes": null,
    "sale_date": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "product_id": 14,
        "product_name": "Potato Chips Classic 150g",
        "product_barcode": "8901234567902",
        "unit_price": 3.00,
        "quantity": 5,
        "subtotal": 15.00,
        "discount": 0.00,
        "tax_amount": 1.50
      }
    ]
  }
}
```

---

### 5.3 Create Sale
Create new sale transaction.

**Endpoint:** `POST /api/sales`

**Access:** All authenticated users

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 14,
      "quantity": 5,
      "discount": 0
    },
    {
      "product_id": 17,
      "quantity": 10,
      "discount": 0
    }
  ],
  "payment_method": "cash",
  "amount_paid": 50.00,
  "discount_amount": 0,
  "notes": "Customer requested bag"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sale completed successfully",
  "data": {
    "id": 6,
    "invoice_number": "INV202401150006",
    "subtotal": 45.00,
    "tax_amount": 4.50,
    "discount_amount": 0.00,
    "total_amount": 49.50,
    "payment_method": "cash",
    "amount_paid": 50.00,
    "change_amount": 0.50,
    "sale_date": "2024-01-15T14:00:00Z"
  }
}
```

---

### 5.4 Void Sale
Void a completed sale.

**Endpoint:** `PUT /api/sales/:id/void`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "reason": "Customer returned items"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale voided successfully",
  "data": {
    "id": 1,
    "status": "voided"
  }
}
```

---

### 5.5 Generate Invoice PDF
Generate invoice PDF for a sale.

**Endpoint:** `GET /api/sales/:id/invoice`

**Access:** All authenticated users

**Response:** PDF file download

---

### 5.6 Generate Receipt
Generate printable receipt for a sale.

**Endpoint:** `GET /api/sales/:id/receipt`

**Access:** All authenticated users

**Response:** HTML receipt for printing

---

## 6. Inventory API

### 6.1 List Inventory
Get inventory status for all products.

**Endpoint:** `GET /api/inventory`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| low_stock | boolean | - | Filter low stock |
| category_id | int | - | Filter by category |
| search | string | - | Search product name |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "iPhone 15 Pro 128GB",
      "barcode": "8901234567890",
      "sku": "IPH15P128",
      "quantity_available": 25,
      "quantity_reserved": 0,
      "quantity_ordered": 0,
      "reorder_level": 5,
      "stock_status": "in_stock",
      "last_stock_check": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 6.2 Adjust Stock
Manually adjust inventory.

**Endpoint:** `POST /api/inventory/adjust`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "product_id": 1,
  "adjustment_type": "add",
  "quantity": 10,
  "notes": "Stock received from supplier"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory adjusted successfully",
  "data": {
    "product_id": 1,
    "quantity_before": 25,
    "quantity_after": 35,
    "adjustment": 10
  }
}
```

---

### 6.3 Get Inventory Logs
Get inventory change history.

**Endpoint:** `GET /api/inventory/logs`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| product_id | int | - | Filter by product |
| transaction_type | string | - | Filter by type |
| startDate | date | - | Start date |
| endDate | date | - | End date |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "iPhone 15 Pro 128GB",
      "transaction_type": "sale",
      "quantity_change": -1,
      "quantity_before": 26,
      "quantity_after": 25,
      "reference_id": 5,
      "reference_type": "sale",
      "user_name": "Mike Wilson",
      "notes": "Sale item #15",
      "created_at": "2024-01-15T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

## 7. Suppliers API

### 7.1 List Suppliers
Get all suppliers.

**Endpoint:** `GET /api/suppliers`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "TechSupply Co.",
      "contact_person": "Robert Chen",
      "phone": "+1-555-1001",
      "email": "robert@techsupply.com",
      "city": "San Francisco",
      "is_active": true
    }
  ]
}
```

---

### 7.2 Create Supplier
Create new supplier.

**Endpoint:** `POST /api/suppliers`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "New Supplier Inc.",
  "contact_person": "John Doe",
  "phone": "+1-555-2000",
  "email": "john@newsupplier.com",
  "address": "100 Supplier Street",
  "city": "New York",
  "tax_id": "TAX-123456",
  "payment_terms": "Net 30"
}
```

---

### 7.3 Update Supplier
Update supplier information.

**Endpoint:** `PUT /api/suppliers/:id`

**Access:** Admin, Manager

---

### 7.4 Delete Supplier
Delete supplier (must have no purchase orders).

**Endpoint:** `DELETE /api/suppliers/:id`

**Access:** Admin only

---

## 8. Purchase Orders API

### 8.1 List Purchase Orders
Get paginated list of purchase orders.

**Endpoint:** `GET /api/purchase-orders`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| status | string | - | Filter by status |
| supplier_id | int | - | Filter by supplier |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "po_number": "PO202401100001",
      "supplier_id": 1,
      "supplier_name": "TechSupply Co.",
      "user_id": 2,
      "user_name": "John Smith",
      "total_amount": 5500.00,
      "status": "received",
      "order_date": "2024-01-10",
      "expected_date": "2024-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### 8.2 Create Purchase Order
Create new purchase order.

**Endpoint:** `POST /api/purchase-orders`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "supplier_id": 1,
  "expected_date": "2024-01-25",
  "notes": "Monthly restock order",
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "unit_cost": 899.00
    },
    {
      "product_id": 11,
      "quantity": 50,
      "unit_cost": 9.00
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Purchase order created successfully",
  "data": {
    "id": 4,
    "po_number": "PO202401200001",
    "supplier_id": 1,
    "total_amount": 9490.00,
    "status": "pending"
  }
}
```

---

### 8.3 Receive Purchase Order
Mark PO items as received.

**Endpoint:** `PUT /api/purchase-orders/:id/receive`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity_received": 10
    },
    {
      "product_id": 11,
      "quantity_received": 50
    }
  ],
  "notes": "All items received in good condition"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase order received successfully",
  "data": {
    "id": 4,
    "po_number": "PO202401200001",
    "status": "received",
    "received_date": "2024-01-20"
  }
}
```

---

## 9. Reports API

### 9.1 Daily Sales Report
Get sales report for a specific date.

**Endpoint:** `GET /api/reports/daily-sales`

**Access:** Admin, Manager

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| date | date | today | Report date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "summary": {
      "total_transactions": 25,
      "total_sales": 2547.50,
      "cash_sales": 1547.50,
      "card_sales": 1000.00,
      "average_transaction": 101.90,
      "items_sold": 150
    },
    "hourly_breakdown": [
      {
        "hour": 9,
        "transactions": 3,
        "sales": 150.00
      },
      {
        "hour": 10,
        "transactions": 5,
        "sales": 450.00
      }
    ],
    "payment_breakdown": {
      "cash": {
        "count": 15,
        "amount": 1547.50
      },
      "card": {
        "count": 10,
        "amount": 1000.00
      }
    },
    "top_products": [
      {
        "product_name": "iPhone 15 Pro 128GB",
        "quantity": 2,
        "revenue": 2198.00
      }
    ]
  }
}
```

---

### 9.2 Monthly Sales Report
Get sales report for a month.

**Endpoint:** `GET /api/reports/monthly-sales`

**Access:** Admin, Manager

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| year | int | current year | Year |
| month | int | current month | Month (1-12) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "summary": {
      "total_transactions": 750,
      "total_sales": 45890.50,
      "cash_sales": 28540.50,
      "card_sales": 17350.00,
      "average_daily": 1480.34,
      "average_transaction": 61.19
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "transactions": 20,
        "sales": 1250.00
      }
    ],
    "weekly_breakdown": [
      {
        "week": 1,
        "transactions": 180,
        "sales": 11250.00
      }
    ],
    "category_breakdown": [
      {
        "category_name": "Electronics",
        "items_sold": 45,
        "revenue": 15250.00
      }
    ]
  }
}
```

---

### 9.3 Product Performance Report
Get product sales performance.

**Endpoint:** `GET /api/reports/product-performance`

**Access:** Admin, Manager

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startDate | date | - | Start date |
| endDate | date | - | End date |
| category_id | int | - | Filter by category |
| limit | int | 20 | Top products limit |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "products": [
      {
        "product_id": 1,
        "product_name": "iPhone 15 Pro 128GB",
        "sku": "IPH15P128",
        "category_name": "Mobile Phones",
        "quantity_sold": 25,
        "revenue": 27475.00,
        "profit": 5000.00,
        "margin_percent": 18.20
      }
    ]
  }
}
```

---

### 9.4 Export Report to CSV
Export report data to CSV format.

**Endpoint:** `GET /api/reports/export/csv`

**Access:** Admin, Manager

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | - | Report type: daily, monthly, product |
| date | date | - | Date for daily report |
| year | int | - | Year for monthly report |
| month | int | - | Month for monthly report |

**Response:** CSV file download

---

### 9.5 Export Report to PDF
Export report data to PDF format.

**Endpoint:** `GET /api/reports/export/pdf`

**Access:** Admin, Manager

**Response:** PDF file download

---

## 10. Dashboard API

### 10.1 Get Dashboard Summary
Get dashboard statistics.

**Endpoint:** `GET /api/dashboard/summary`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "today": {
      "total_sales": 2547.50,
      "transactions": 25,
      "cash_sales": 1547.50,
      "card_sales": 1000.00
    },
    "month": {
      "total_sales": 45890.50,
      "transactions": 750,
      "revenue_growth": 12.5
    },
    "inventory": {
      "total_products": 45,
      "low_stock_count": 5,
      "out_of_stock_count": 2
    },
    "pending_orders": 3
  }
}
```

---

### 10.2 Get Sales Chart Data
Get data for sales chart.

**Endpoint:** `GET /api/dashboard/sales-chart`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | week | day, week, month, year |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "datasets": [
      {
        "label": "Sales",
        "data": [1200, 1450, 980, 1560, 1890, 2100, 1750]
      }
    ]
  }
}
```

---

### 10.3 Get Top Products
Get top selling products.

**Endpoint:** `GET /api/dashboard/top-products`

**Access:** All authenticated users

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 10 | Number of products |
| period | string | month | day, week, month, year |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "iPhone 15 Pro 128GB",
      "quantity_sold": 25,
      "revenue": 27475.00
    }
  ]
}
```

---

### 10.4 Get Low Stock Alerts
Get products with low stock.

**Endpoint:** `GET /api/dashboard/low-stock`

**Access:** All authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 5,
      "product_name": "Dell XPS 15 Laptop",
      "barcode": "8901234567894",
      "quantity_in_stock": 3,
      "reorder_level": 3,
      "status": "low_stock"
    }
  ]
}
```

---

## 11. Settings API

### 11.1 Get All Settings
Get all system settings.

**Endpoint:** `GET /api/settings`

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "setting_key": "company_name",
      "setting_value": "POS System Store",
      "setting_type": "string",
      "description": "Company name for receipts"
    }
  ]
}
```

---

### 11.2 Update Setting
Update a setting value.

**Endpoint:** `PUT /api/settings/:key`

**Access:** Admin only

**Request Body:**
```json
{
  "value": "New Company Name"
}
```

---

---

## Rate Limiting

API requests are rate limited:

| User Type | Limit |
|-----------|-------|
| Anonymous | 100 requests / 15 min |
| Authenticated | 300 requests / 15 min |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1705312800
```

---

## Webhooks (Future)

Webhooks will be available for:
- Sale completed
- Low stock alert
- Purchase order received
- User created

---

*Document Version: 1.0*
*Last Updated: February 2026*
