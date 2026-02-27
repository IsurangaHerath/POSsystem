/**
 * Sale Model
 * 
 * Database operations for sales transactions.
 */

const db = require('../config/database');

/**
 * Sale model class
 */
class Sale {
    /**
     * Create a new sale
     * @param {Object} saleData - Sale data
     * @returns {Promise<number>} Inserted sale ID
     */
    static async create(saleData) {
        const {
            invoice_number,
            user_id,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            payment_method,
            amount_paid,
            change_amount,
            notes = null
        } = saleData;

        const sql = `
      INSERT INTO sales (
        invoice_number, user_id, subtotal, tax_amount, discount_amount,
        total_amount, payment_method, amount_paid, change_amount, notes, sale_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

        const result = await db.query(sql, [
            invoice_number, user_id, subtotal, tax_amount, discount_amount,
            total_amount, payment_method, amount_paid, change_amount, notes
        ]);

        return result.insertId;
    }

    /**
     * Create sale item
     * @param {number} saleId - Sale ID
     * @param {Object} itemData - Item data
     * @returns {Promise<number>} Inserted item ID
     */
    static async createItem(saleId, itemData) {
        const {
            product_id,
            product_name,
            product_barcode,
            unit_price,
            quantity,
            subtotal,
            discount,
            tax_amount
        } = itemData;

        const sql = `
      INSERT INTO sale_items (
        sale_id, product_id, product_name, product_barcode,
        unit_price, quantity, subtotal, discount, tax_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(sql, [
            saleId, product_id, product_name, product_barcode,
            unit_price, quantity, subtotal, discount, tax_amount
        ]);

        return result.insertId;
    }

    /**
     * Find sale by ID
     * @param {number} id - Sale ID
     * @returns {Promise<Object|null>} Sale object or null
     */
    static async findById(id) {
        const sql = `
      SELECT s.*, u.full_name as cashier_name
      FROM sales s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `;

        return db.getOne(sql, [id]);
    }

    /**
     * Find sale by ID with items
     * @param {number} id - Sale ID
     * @returns {Promise<Object|null>} Sale with items or null
     */
    static async findByIdWithItems(id) {
        const sale = await this.findById(id);

        if (!sale) {
            return null;
        }

        const itemsSql = `
      SELECT * FROM sale_items
      WHERE sale_id = ?
      ORDER BY id
    `;

        const items = await db.getMany(itemsSql, [id]);
        sale.items = items;

        return sale;
    }

    /**
     * Get all sales with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Sales and pagination info
     */
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 20,
            startDate = null,
            endDate = null,
            status = null,
            payment_method = null,
            user_id = null
        } = options;

        // Build WHERE clause
        const conditions = [];
        const params = [];

        if (startDate) {
            conditions.push('DATE(s.sale_date) >= ?');
            params.push(startDate);
        }

        if (endDate) {
            conditions.push('DATE(s.sale_date) <= ?');
            params.push(endDate);
        }

        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (payment_method) {
            conditions.push('s.payment_method = ?');
            params.push(payment_method);
        }

        if (user_id) {
            conditions.push('s.user_id = ?');
            params.push(user_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countSql = `
      SELECT COUNT(*) as total 
      FROM sales s
      ${whereClause}
    `;
        const countResult = await db.getOne(countSql, params);
        const total = countResult.total;

        // Get paginated results
        const offset = (page - 1) * limit;
        const sql = `
      SELECT s.*, u.full_name as cashier_name,
        (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
      FROM sales s
      JOIN users u ON u.id = s.user_id
      ${whereClause}
      ORDER BY s.sale_date DESC
      LIMIT ? OFFSET ?
    `;

        const sales = await db.getMany(sql, [...params, limit, offset]);

        return {
            sales,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Void a sale
     * @param {number} id - Sale ID
     * @returns {Promise<boolean>} Update success
     */
    static async voidSale(id) {
        const sql = 'UPDATE sales SET status = ? WHERE id = ?';
        const result = await db.query(sql, ['voided', id]);

        return result.affectedRows > 0;
    }

    /**
     * Get sale items
     * @param {number} saleId - Sale ID
     * @returns {Promise<Array>} Array of sale items
     */
    static async getSaleItems(saleId) {
        const sql = 'SELECT * FROM sale_items WHERE sale_id = ?';
        return db.getMany(sql, [saleId]);
    }

    /**
     * Generate invoice number
     * @returns {Promise<string>} Invoice number
     */
    static async generateInvoiceNumber() {
        const date = new Date();
        const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');

        const sql = `
      SELECT COUNT(*) as count 
      FROM sales 
      WHERE DATE(sale_date) = CURRENT_DATE
    `;
        const result = await db.getOne(sql);
        const sequence = (result.count + 1).toString().padStart(4, '0');

        return `INV${datePart}${sequence}`;
    }

    /**
     * Log inventory change
     * @param {number} productId - Product ID
     * @param {number} quantityChange - Quantity change (+/-)
     * @param {number} referenceId - Reference ID
     * @param {string} referenceType - Reference type
     * @param {number} userId - User ID
     * @param {string} notes - Notes
     */
    static async logInventoryChange(productId, quantityChange, referenceId, referenceType, userId, notes = null) {
        // Get current quantity
        const productSql = 'SELECT quantity_in_stock FROM products WHERE id = ?';
        const product = await db.getOne(productSql, [productId]);

        if (!product) return;

        const quantityBefore = product.quantity_in_stock;
        const quantityAfter = quantityBefore + quantityChange;

        const sql = `
      INSERT INTO inventory_logs (
        product_id, transaction_type, quantity_change,
        quantity_before, quantity_after, reference_id,
        reference_type, user_id, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await db.query(sql, [
            productId,
            quantityChange < 0 ? 'sale' : 'return',
            quantityChange,
            quantityBefore,
            quantityAfter,
            referenceId,
            referenceType,
            userId,
            notes
        ]);
    }

    /**
     * Get daily sales summary
     * @param {string} date - Date string
     * @returns {Promise<Object>} Daily summary
     */
    static async getDailySummary(date) {
        const sql = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END), 0) as card_sales,
        COALESCE(AVG(total_amount), 0) as average_transaction
      FROM sales
      WHERE DATE(sale_date) = ? AND status = 'completed'
    `;

        return db.getOne(sql, [date]);
    }

    /**
     * Get monthly sales summary
     * @param {number} year - Year
     * @param {number} month - Month
     * @returns {Promise<Object>} Monthly summary
     */
    static async getMonthlySummary(year, month) {
        const sql = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END), 0) as card_sales,
        COALESCE(AVG(total_amount), 0) as average_transaction
      FROM sales
      WHERE YEAR(sale_date) = ? AND MONTH(sale_date) = ? AND status = 'completed'
    `;

        return db.getOne(sql, [year, month]);
    }

    /**
     * Get top selling products
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Top products
     */
    static async getTopProducts(options = {}) {
        const { limit = 10, startDate = null, endDate = null } = options;

        const conditions = ["s.status = 'completed'"];
        const params = [];

        if (startDate) {
            conditions.push('DATE(s.sale_date) >= ?');
            params.push(startDate);
        }

        if (endDate) {
            conditions.push('DATE(s.sale_date) <= ?');
            params.push(endDate);
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        const sql = `
      SELECT 
        p.id, p.name, p.barcode,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      JOIN products p ON p.id = si.product_id
      ${whereClause}
      GROUP BY p.id, p.name, p.barcode
      ORDER BY total_quantity DESC
      LIMIT ?
    `;

        return db.getMany(sql, [...params, limit]);
    }
}

module.exports = Sale;
