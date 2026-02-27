/**
 * Product Model
 * 
 * Database operations for product management.
 */

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Product model class
 */
class Product {
    /**
     * Create a new product
     * @param {Object} productData - Product data
     * @returns {Promise<number>} Inserted product ID
     */
    static async create(productData) {
        const {
            name,
            barcode = null,
            sku,
            category_id = null,
            cost_price = 0,
            selling_price,
            quantity_in_stock = 0,
            reorder_level = 10,
            unit = 'piece',
            description = null,
            image_url = null,
            tax_rate = 0
        } = productData;

        const sql = `
      INSERT INTO products (
        name, barcode, sku, category_id, cost_price, selling_price,
        quantity_in_stock, reorder_level, unit, description, image_url, tax_rate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(sql, [
            name, barcode, sku, category_id, cost_price, selling_price,
            quantity_in_stock, reorder_level, unit, description, image_url, tax_rate
        ]);

        // Create inventory record
        const productId = result.insertId;
        await db.query(
            'INSERT INTO inventory (product_id, quantity_available, quantity_reserved, quantity_ordered) VALUES (?, ?, 0, 0)',
            [productId, quantity_in_stock]
        );

        return productId;
    }

    /**
     * Find product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} Product object or null
     */
    static async findById(id) {
        const sql = `
      SELECT p.*, c.name as category_name,
        i.quantity_available, i.quantity_reserved, i.quantity_ordered,
        CASE 
          WHEN p.quantity_in_stock <= 0 THEN 'out_of_stock'
          WHEN p.quantity_in_stock <= p.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN inventory i ON i.product_id = p.id
      WHERE p.id = ?
    `;

        return db.getOne(sql, [id]);
    }

    /**
     * Find product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object|null>} Product object or null
     */
    static async findByBarcode(barcode) {
        const sql = `
      SELECT id, name, barcode, sku, selling_price, quantity_in_stock, tax_rate
      FROM products
      WHERE barcode = ? AND is_active = TRUE
    `;

        return db.getOne(sql, [barcode]);
    }

    /**
     * Find product by SKU
     * @param {string} sku - Product SKU
     * @returns {Promise<Object|null>} Product object or null
     */
    static async findBySku(sku) {
        const sql = `
      SELECT * FROM products WHERE sku = ?
    `;

        return db.getOne(sql, [sku]);
    }

    /**
     * Get all products with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Products and pagination info
     */
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 20,
            category_id = null,
            is_active = null,
            low_stock = false,
            search = null,
            sortBy = 'name',
            sortOrder = 'ASC'
        } = options;

        // Build WHERE clause
        const conditions = ['p.is_active = TRUE'];
        const params = [];

        if (category_id) {
            conditions.push('p.category_id = ?');
            params.push(category_id);
        }

        if (is_active !== null) {
            conditions.push('p.is_active = ?');
            params.push(is_active);
        }

        if (low_stock) {
            conditions.push('p.quantity_in_stock <= p.reorder_level');
        }

        if (search) {
            conditions.push('(p.name LIKE ? OR p.barcode LIKE ? OR p.sku LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
        const countResult = await db.getOne(countSql, params);
        const total = countResult.total;

        // Get paginated results
        const offset = (page - 1) * limit;
        const validSortColumns = ['id', 'name', 'sku', 'selling_price', 'quantity_in_stock', 'created_at'];
        const validSortOrder = ['ASC', 'DESC'];
        const orderBy = validSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.name';
        const order = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        const sql = `
      SELECT p.*, c.name as category_name,
        CASE 
          WHEN p.quantity_in_stock <= 0 THEN 'out_of_stock'
          WHEN p.quantity_in_stock <= p.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${orderBy} ${order}
      LIMIT ? OFFSET ?
    `;

        const products = await db.getMany(sql, [...params, limit, offset]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Update product
     * @param {number} id - Product ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Update success
     */
    static async update(id, updateData) {
        const allowedFields = [
            'name', 'barcode', 'sku', 'category_id', 'cost_price', 'selling_price',
            'quantity_in_stock', 'reorder_level', 'unit', 'description', 'image_url',
            'tax_rate', 'is_active'
        ];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(id);
        const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
        const result = await db.query(sql, values);

        return result.affectedRows > 0;
    }

    /**
     * Delete product (soft delete)
     * @param {number} id - Product ID
     * @returns {Promise<boolean>} Delete success
     */
    static async delete(id) {
        const sql = 'UPDATE products SET is_active = FALSE WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Check if SKU exists
     * @param {string} sku - SKU to check
     * @param {number} excludeId - Product ID to exclude
     * @returns {Promise<boolean>} SKU exists
     */
    static async skuExists(sku, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM products WHERE sku = ?';
        const params = [sku];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await db.getOne(sql, params);
        return result.count > 0;
    }

    /**
     * Check if barcode exists
     * @param {string} barcode - Barcode to check
     * @param {number} excludeId - Product ID to exclude
     * @returns {Promise<boolean>} Barcode exists
     */
    static async barcodeExists(barcode, excludeId = null) {
        if (!barcode) return false;

        let sql = 'SELECT COUNT(*) as count FROM products WHERE barcode = ?';
        const params = [barcode];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await db.getOne(sql, params);
        return result.count > 0;
    }

    /**
     * Get low stock products
     * @returns {Promise<Array>} Array of low stock products
     */
    static async getLowStock() {
        const sql = `
      SELECT id, name, barcode, sku, quantity_in_stock, reorder_level,
        CASE 
          WHEN quantity_in_stock <= 0 THEN 'out_of_stock'
          ELSE 'low_stock'
        END as stock_status
      FROM products
      WHERE quantity_in_stock <= reorder_level
      AND is_active = TRUE
      ORDER BY quantity_in_stock ASC
    `;

        return db.getMany(sql);
    }

    /**
     * Update stock quantity
     * @param {number} id - Product ID
     * @param {number} quantity - Quantity to add (negative to subtract)
     * @returns {Promise<boolean>} Update success
     */
    static async updateStock(id, quantity) {
        const sql = `
      UPDATE products 
      SET quantity_in_stock = quantity_in_stock + ?
      WHERE id = ?
    `;
        const result = await db.query(sql, [quantity, id]);

        // Also update inventory table
        await db.query(
            'UPDATE inventory SET quantity_available = quantity_available + ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
            [quantity, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @returns {Promise<Array>} Array of products
     */
    static async findByCategory(categoryId) {
        const sql = `
      SELECT * FROM products
      WHERE category_id = ? AND is_active = TRUE
      ORDER BY name
    `;

        return db.getMany(sql, [categoryId]);
    }

    /**
     * Get total products count
     * @returns {Promise<number>} Total products
     */
    static async getTotalCount() {
        const sql = 'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE';
        const result = await db.getOne(sql);

        return result.count;
    }
}

module.exports = Product;
