/**
 * Category Model
 * 
 * Database operations for category management.
 */

const db = require('../config/database');

/**
 * Category model class
 */
class Category {
    /**
     * Create a new category
     * @param {Object} categoryData - Category data
     * @returns {Promise<number>} Inserted category ID
     */
    static async create(categoryData) {
        const { name, description = null, parent_id = null } = categoryData;

        const sql = `
      INSERT INTO categories (name, description, parent_id)
      VALUES (?, ?, ?)
    `;

        const result = await db.query(sql, [name, description, parent_id]);
        return result.insertId;
    }

    /**
     * Find category by ID
     * @param {number} id - Category ID
     * @returns {Promise<Object|null>} Category object or null
     */
    static async findById(id) {
        const sql = `
      SELECT c.*, p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `;

        return db.getOne(sql, [id]);
    }

    /**
     * Get all categories as flat list
     * @returns {Promise<Array>} Array of categories
     */
    static async findAll() {
        const sql = `
      SELECT c.*, p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.name
    `;

        return db.getMany(sql);
    }

    /**
     * Get all categories as tree structure
     * @returns {Promise<Array>} Array of categories with children
     */
    static async findAllTree() {
        const categories = await this.findAll();

        // Build tree structure
        const categoryMap = {};
        const tree = [];

        // First pass: create map
        categories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        // Second pass: build tree
        categories.forEach(cat => {
            if (cat.parent_id && categoryMap[cat.parent_id]) {
                categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
            } else {
                tree.push(categoryMap[cat.id]);
            }
        });

        return tree;
    }

    /**
     * Update category
     * @param {number} id - Category ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Update success
     */
    static async update(id, updateData) {
        const allowedFields = ['name', 'description', 'parent_id', 'is_active'];
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
        const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
        const result = await db.query(sql, values);

        return result.affectedRows > 0;
    }

    /**
     * Delete category
     * @param {number} id - Category ID
     * @returns {Promise<boolean>} Delete success
     */
    static async delete(id) {
        const sql = 'DELETE FROM categories WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Check if category name exists
     * @param {string} name - Category name
     * @param {number} excludeId - Category ID to exclude
     * @returns {Promise<boolean>} Name exists
     */
    static async nameExists(name, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM categories WHERE name = ?';
        const params = [name];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await db.getOne(sql, params);
        return result.count > 0;
    }

    /**
     * Check if category has products
     * @param {number} id - Category ID
     * @returns {Promise<boolean>} Has products
     */
    static async hasProducts(id) {
        const sql = 'SELECT COUNT(*) as count FROM products WHERE category_id = ?';
        const result = await db.getOne(sql, [id]);

        return result.count > 0;
    }

    /**
     * Check if category has children
     * @param {number} id - Category ID
     * @returns {Promise<boolean>} Has children
     */
    static async hasChildren(id) {
        const sql = 'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?';
        const result = await db.getOne(sql, [id]);

        return result.count > 0;
    }

    /**
     * Get child categories
     * @param {number} parentId - Parent category ID
     * @returns {Promise<Array>} Array of child categories
     */
    static async getChildren(parentId) {
        const sql = `
      SELECT * FROM categories
      WHERE parent_id = ?
      ORDER BY name
    `;

        return db.getMany(sql, [parentId]);
    }

    /**
     * Get category path (breadcrumb)
     * @param {number} id - Category ID
     * @returns {Promise<Array>} Array of categories from root to current
     */
    static async getPath(id) {
        const path = [];
        let current = await this.findById(id);

        while (current) {
            path.unshift(current);
            if (current.parent_id) {
                current = await this.findById(current.parent_id);
            } else {
                break;
            }
        }

        return path;
    }
}

module.exports = Category;
