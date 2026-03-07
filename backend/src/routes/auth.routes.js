const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/rbac');
const { asyncHandler } = require('../middleware/errorHandler');

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

router.post('/logout',
    authenticate,
    asyncHandler(authController.logout)
);

router.post('/refresh',
    [
        body('refreshToken')
            .notEmpty()
            .withMessage('Refresh token is required')
    ],
    asyncHandler(authController.refresh)
);

router.get('/me',
    authenticate,
    asyncHandler(authController.getCurrentUser)
);

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
