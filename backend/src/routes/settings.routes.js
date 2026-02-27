/**
 * Settings Routes
 * 
 * Routes for system settings operations.
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Private (Admin only)
 */
router.get('/',
    authenticate,
    adminOnly,
    asyncHandler(settingsController.getSettings)
);

/**
 * @route   GET /api/settings/:key
 * @desc    Get setting by key
 * @access  Private (Admin only)
 */
router.get('/:key',
    authenticate,
    adminOnly,
    asyncHandler(settingsController.getSettingByKey)
);

/**
 * @route   PUT /api/settings/:key
 * @desc    Update setting
 * @access  Private (Admin only)
 */
router.put('/:key',
    authenticate,
    adminOnly,
    [
        body('value')
            .notEmpty()
            .withMessage('Setting value is required')
    ],
    asyncHandler(settingsController.updateSetting)
);

module.exports = router;
