/**
 * Supplier Model
 * 
 * Database operations for supplier management.
 */

const db = require('../config/database');

/**
 * Supplier model class
 */
class Supplier {
    /**
     * Create a new supplier
     * @param {Object} supplierData - Supplier data
     * @returns {Promise<number>} Inserted supplier ID
     */
    static async create(supplierData) {
        const {
            name,
            contact_person = null,
            phone = null,
            email = null,
            address = null,
            city = null,
            tax_id = null,
            payment_terms = null
        } = supplierData;

        const sql = `
      INSERT INTO suppliers (
        name, contact_person, phone, email, address, city, tax_id, payment_terms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(sql, [
            name, contact_person, phone, email, address, city, tax_id, payment_terms
        ]);

        return result.insertId;
    }

    /**
     * Find supplier by ID
     * @param {number} id - Supplier ID
     * @returns {Promise<Object|null>} Supplier object or null
     */
    static async findById(id) {
        const sql = 'SELECT * FROM suppliers WHERE id = ?';
        return db.getOne(sql, [id]);
    }

    /**
     * Get all suppliers
     * @param {boolean} isActive - Filter by active status
     * @returns {Promise<Array>} Array of suppliers
     */
    static async findAll(isActive = null) {
        let sql = 'SELECT * FROM suppliers';
        const params = [];

        if (isActive !== null) {
            sql += ' WHERE is_active = ?';
            params.push(isActive);
        }

        sql += ' ORDER BY name';

        return db.getMany(sql, params);
    }

    /**
     * Update supplier
     * @param {number} id - Supplier ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Update success
     */
    static async update(id, updateData) {
        const allowedFields = [
            'name', 'contact_person', 'phone', 'email',
            'address', 'city', 'tax_id', 'payment_terms', 'is_active'
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
        const sql = `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`;
        const result = await db.query(sql, values);

        return result.affectedRows > 0;
    }

    /**
     * Delete supplier
     * @param {number} id - Supplier ID
     * @returns {Promise<boolean>} Delete success
     */
    static async delete(id) {
        const sql = 'DELETE FROM suppliers WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Check if supplier has purchase orders
     * @param {number} id - Supplier ID
     * @returns {Promise<boolean>} Has purchase orders
     */
    static async hasPurchaseOrders(id) {
        const sql = 'SELECT COUNT(*) as count FROM purchase_orders WHERE supplier_id = ?';
        const result = await db.getOne(sql, [id]);

        return result.count > 0;
    }

    /**
     * Get supplier products
     * @param {number} supplierId - Supplier ID
     * @returns {Promise<Array>} Array of products
     */
    static async getProducts(supplierId) {
        const sql = `
      SELECT p.*, ps.supplier_price, ps.supplier_code, ps.is_preferred
      FROM product_suppliers ps
      JOIN products p ON p.id = ps.product_id
      WHERE ps.supplier_id = ?
      ORDER BY p.name
    `;

        return db.getMany(sql, [supplierId]);
    }
}

module.exports = Supplier;
