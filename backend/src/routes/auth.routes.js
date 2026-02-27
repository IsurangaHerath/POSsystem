/**
 * Authentication Routes
 * 
 * Routes for user authentication operations.
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 */
router.post('/login',
    [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    asyncHandler(authController.login)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
    authenticate,
    asyncHandler(authController.logout)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh',
    [
        body('refreshToken')
            .notEmpty()
            .withMessage('Refresh token is required')
    ],
    asyncHandler(authController.refresh)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
    authenticate,
    asyncHandler(authController.getCurrentUser)
);

/**
 * @route   PUT /api/auth/password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/password',
    authenticate,
    [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage('Passwords do not match')
    ],
    asyncHandler(authController.changePassword)
);

/**
 * @route   POST /api/auth/reset-password/:userId
 * @desc    Reset user password (admin only)
 * @access  Private (Admin only)
 */
router.post('/reset-password/:userId',
    authenticate,
    adminOnly,
    [
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
    ],
    asyncHandler(authController.resetPassword)
);

module.exports = router;
