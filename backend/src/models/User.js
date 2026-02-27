/**
 * User Model
 * 
 * Database operations for user management.
 */

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * User model class
 */
class User {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<number>} Inserted user ID
     */
    static async create(userData) {
        const {
            username,
            email,
            password_hash,
            full_name,
            role = 'cashier',
            phone = null
        } = userData;

        const sql = `
      INSERT INTO users (username, email, password_hash, full_name, role, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(sql, [username, email, password_hash, full_name, role, phone]);
        return result.insertId;
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    static async findById(id) {
        const sql = `
      SELECT id, username, email, full_name, role, phone, is_active, 
             last_login, created_at, updated_at
      FROM users
      WHERE id = ?
    `;

        return db.getOne(sql, [id]);
    }

    /**
     * Find user by username
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByUsername(username) {
        const sql = `
      SELECT id, username, email, password_hash, full_name, role, phone, 
             is_active, last_login, created_at, updated_at
      FROM users
      WHERE username = ?
    `;

        return db.getOne(sql, [username]);
    }

    /**
     * Find user by email
     * @param {string} email - Email address
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByEmail(email) {
        const sql = `
      SELECT id, username, email, password_hash, full_name, role, phone, 
             is_active, last_login, created_at, updated_at
      FROM users
      WHERE email = ?
    `;

        return db.getOne(sql, [email]);
    }

    /**
     * Find user by username or email
     * @param {string} identifier - Username or email
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByUsernameOrEmail(identifier) {
        const sql = `
      SELECT id, username, email, password_hash, full_name, role, phone, 
             is_active, last_login, created_at, updated_at
      FROM users
      WHERE username = ? OR email = ?
    `;

        return db.getOne(sql, [identifier, identifier]);
    }

    /**
     * Get all users with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Users and pagination info
     */
    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 20,
            role = null,
            is_active = null,
            search = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;

        // Build WHERE clause
        const conditions = [];
        const params = [];

        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }

        if (is_active !== null) {
            conditions.push('is_active = ?');
            params.push(is_active);
        }

        if (search) {
            conditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await db.getOne(countSql, params);
        const total = countResult.total;

        // Get paginated results
        const offset = (page - 1) * limit;
        const validSortColumns = ['id', 'username', 'email', 'full_name', 'role', 'created_at'];
        const validSortOrder = ['ASC', 'DESC'];
        const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const sql = `
      SELECT id, username, email, full_name, role, phone, is_active, 
             last_login, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${orderBy} ${order}
      LIMIT ? OFFSET ?
    `;

        const users = await db.getMany(sql, [...params, limit, offset]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} Update success
     */
    static async update(id, updateData) {
        const allowedFields = ['username', 'email', 'full_name', 'role', 'phone', 'is_active'];
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
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        const result = await db.query(sql, values);

        return result.affectedRows > 0;
    }

    /**
     * Update user password
     * @param {number} id - User ID
     * @param {string} password_hash - New password hash
     * @returns {Promise<boolean>} Update success
     */
    static async updatePassword(id, password_hash) {
        const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
        const result = await db.query(sql, [password_hash, id]);

        return result.affectedRows > 0;
    }

    /**
     * Update last login timestamp
     * @param {number} id - User ID
     * @returns {Promise<boolean>} Update success
     */
    static async updateLastLogin(id) {
        const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Delete user (soft delete by setting is_active = false)
     * @param {number} id - User ID
     * @returns {Promise<boolean>} Delete success
     */
    static async delete(id) {
        const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Hard delete user
     * @param {number} id - User ID
     * @returns {Promise<boolean>} Delete success
     */
    static async hardDelete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await db.query(sql, [id]);

        return result.affectedRows > 0;
    }

    /**
     * Check if username exists
     * @param {string} username - Username to check
     * @param {number} excludeId - User ID to exclude from check
     * @returns {Promise<boolean>} Username exists
     */
    static async usernameExists(username, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
        const params = [username];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await db.getOne(sql, params);
        return result.count > 0;
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @param {number} excludeId - User ID to exclude from check
     * @returns {Promise<boolean>} Email exists
     */
    static async emailExists(email, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        const params = [email];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const result = await db.getOne(sql, params);
        return result.count > 0;
    }

    /**
     * Get users by role
     * @param {string} role - Role name
     * @returns {Promise<Array>} Array of users
     */
    static async findByRole(role) {
        const sql = `
      SELECT id, username, email, full_name, role, phone, is_active, 
             last_login, created_at, updated_at
      FROM users
      WHERE role = ? AND is_active = TRUE
      ORDER BY full_name
    `;

        return db.getMany(sql, [role]);
    }

    /**
     * Get active users count
     * @returns {Promise<number>} Active users count
     */
    static async getActiveCount() {
        const sql = 'SELECT COUNT(*) as count FROM users WHERE is_active = TRUE';
        const result = await db.getOne(sql);

        return result.count;
    }

    /**
     * Get users count by role
     * @returns {Promise<Object>} Users count by role
     */
    static async getCountByRole() {
        const sql = `
      SELECT role, COUNT(*) as count
      FROM users
      WHERE is_active = TRUE
      GROUP BY role
    `;

        const results = await db.getMany(sql);
        const counts = {};

        for (const row of results) {
            counts[row.role] = row.count;
        }

        return counts;
    }
}

module.exports = User;
