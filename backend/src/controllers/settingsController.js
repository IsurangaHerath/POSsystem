/**
 * Settings Controller
 * 
 * Handles system settings operations.
 */

const db = require('../config/database');
const { successResponse } = require('../utils/response');
const { NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all settings
 * @route GET /api/settings
 */
const getSettings = async (req, res, next) => {
    try {
        const sql = 'SELECT * FROM settings ORDER BY setting_key';
        const settings = await db.getMany(sql);

        return successResponse(res, settings);
    } catch (error) {
        next(error);
    }
};

/**
 * Get setting by key
 * @route GET /api/settings/:key
 */
const getSettingByKey = async (req, res, next) => {
    try {
        const { key } = req.params;

        const sql = 'SELECT * FROM settings WHERE setting_key = ?';
        const setting = await db.getOne(sql, [key]);

        if (!setting) {
            throw new NotFoundError('Setting not found');
        }

        return successResponse(res, setting);
    } catch (error) {
        next(error);
    }
};

/**
 * Update setting
 * @route PUT /api/settings/:key
 */
const updateSetting = async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        // Check if setting exists
        const checkSql = 'SELECT * FROM settings WHERE setting_key = ?';
        const existing = await db.getOne(checkSql, [key]);

        if (!existing) {
            // Create new setting if doesn't exist
            const insertSql = 'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)';
            await db.query(insertSql, [key, value]);
        } else {
            // Update existing setting
            const updateSql = 'UPDATE settings SET setting_value = ? WHERE setting_key = ?';
            await db.query(updateSql, [value, key]);
        }

        // Get updated setting
        const setting = await db.getOne(checkSql, [key]);

        logger.info(`Setting updated: ${key} by ${req.user.username}`);

        return successResponse(res, setting, 'Setting updated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    getSettingByKey,
    updateSetting
};
