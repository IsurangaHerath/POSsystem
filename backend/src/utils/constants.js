/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

// User roles
const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
};

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
    admin: 3,
    manager: 2,
    cashier: 1
};

// Sale status
const SALE_STATUS = {
    COMPLETED: 'completed',
    VOIDED: 'voided',
    REFUNDED: 'refunded'
};

// Payment methods
const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    MIXED: 'mixed'
};

// Purchase order status
const PO_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    RECEIVED: 'received',
    CANCELLED: 'cancelled'
};

// Inventory transaction types
const INVENTORY_TRANSACTION_TYPES = {
    SALE: 'sale',
    PURCHASE: 'purchase',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return'
};

// Stock status
const STOCK_STATUS = {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
};

// Error codes
const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

// HTTP status codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

// Date formats
const DATE_FORMATS = {
    DISPLAY: 'YYYY-MM-DD',
    DATETIME_DISPLAY: 'YYYY-MM-DD HH:mm:ss',
    INVOICE: 'YYYYMMDD'
};

// Default settings
const DEFAULT_SETTINGS = {
    TAX_RATE: 10.00,
    CURRENCY_SYMBOL: '$',
    CURRENCY_CODE: 'USD',
    LOW_STOCK_THRESHOLD: 10,
    INVOICE_PREFIX: 'INV',
    PO_PREFIX: 'PO'
};

// Permission definitions
const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',

    // Products
    VIEW_PRODUCTS: 'view_products',
    CREATE_PRODUCTS: 'create_products',
    EDIT_PRODUCTS: 'edit_products',
    DELETE_PRODUCTS: 'delete_products',

    // Categories
    VIEW_CATEGORIES: 'view_categories',
    MANAGE_CATEGORIES: 'manage_categories',

    // Sales
    CREATE_SALES: 'create_sales',
    VIEW_SALES: 'view_sales',
    VOID_SALES: 'void_sales',

    // Inventory
    VIEW_INVENTORY: 'view_inventory',
    ADJUST_INVENTORY: 'adjust_inventory',

    // Suppliers
    VIEW_SUPPLIERS: 'view_suppliers',
    MANAGE_SUPPLIERS: 'manage_suppliers',

    // Purchase Orders
    VIEW_PURCHASE_ORDERS: 'view_purchase_orders',
    CREATE_PURCHASE_ORDERS: 'create_purchase_orders',
    APPROVE_PURCHASE_ORDERS: 'approve_purchase_orders',
    RECEIVE_PURCHASE_ORDERS: 'receive_purchase_orders',

    // Reports
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',

    // Users
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',

    // Settings
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
    admin: Object.values(PERMISSIONS), // Admin has all permissions

    manager: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.CREATE_PRODUCTS,
        PERMISSIONS.EDIT_PRODUCTS,
        PERMISSIONS.VIEW_CATEGORIES,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.CREATE_SALES,
        PERMISSIONS.VIEW_SALES,
        PERMISSIONS.VOID_SALES,
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.ADJUST_INVENTORY,
        PERMISSIONS.VIEW_SUPPLIERS,
        PERMISSIONS.MANAGE_SUPPLIERS,
        PERMISSIONS.VIEW_PURCHASE_ORDERS,
        PERMISSIONS.CREATE_PURCHASE_ORDERS,
        PERMISSIONS.APPROVE_PURCHASE_ORDERS,
        PERMISSIONS.RECEIVE_PURCHASE_ORDERS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_REPORTS
    ],

    cashier: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_CATEGORIES,
        PERMISSIONS.CREATE_SALES,
        PERMISSIONS.VIEW_SALES,
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.VIEW_SUPPLIERS,
        PERMISSIONS.VIEW_PURCHASE_ORDERS
    ]
};

module.exports = {
    ROLES,
    ROLE_HIERARCHY,
    SALE_STATUS,
    PAYMENT_METHODS,
    PO_STATUS,
    INVENTORY_TRANSACTION_TYPES,
    STOCK_STATUS,
    ERROR_CODES,
    HTTP_STATUS,
    PAGINATION,
    DATE_FORMATS,
    DEFAULT_SETTINGS,
    PERMISSIONS,
    ROLE_PERMISSIONS
};
