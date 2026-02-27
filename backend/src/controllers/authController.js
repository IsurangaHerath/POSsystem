/**
 * Authentication Controller
 * 
 * Handles user authentication operations including login, logout,
 * token refresh, and password management.
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/response');
const { AuthenticationError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Salt rounds for bcrypt
const SALT_ROUNDS = 12;

/**
 * Login controller
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findByUsernameOrEmail(username);

        if (!user) {
            logger.warn(`Login attempt with invalid username: ${username}`);
            throw new AuthenticationError('Invalid username or password');
        }

        // Check if user is active
        if (!user.is_active) {
            logger.warn(`Login attempt for inactive user: ${username}`);
            throw new AuthenticationError('Account is deactivated. Please contact administrator.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            logger.warn(`Invalid password attempt for user: ${username}`);
            throw new AuthenticationError('Invalid username or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Update last login
        await User.updateLastLogin(user.id);

        logger.info(`User logged in successfully: ${username}`);

        // Return user info and tokens
        return successResponse(res, {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            },
            tokens: {
                accessToken,
                refreshToken
            }
        }, 'Login successful');

    } catch (error) {
        next(error);
    }
};

/**
 * Logout controller
 * @route POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token. Here we just log the action.

        if (req.user) {
            logger.info(`User logged out: ${req.user.username}`);
        }

        return successResponse(res, null, 'Logout successful');
    } catch (error) {
        next(error);
    }
};

/**
 * Refresh token controller
 * @route POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AuthenticationError('Refresh token is required');
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        // Get user
        const user = await User.findById(decoded.id);

        if (!user || !user.is_active) {
            throw new AuthenticationError('User not found or inactive');
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        logger.info(`Token refreshed for user: ${user.username}`);

        return successResponse(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }, 'Token refreshed successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 * @route PUT /api/auth/password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            throw new ValidationError('New passwords do not match');
        }

        // Validate password strength
        if (newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        // Get user with password hash
        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Get full user data with password hash
        const fullUser = await User.findByUsername(user.username);

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, fullUser.password_hash);

        if (!isPasswordValid) {
            throw new AuthenticationError('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await User.updatePassword(userId, newPasswordHash);

        logger.info(`Password changed for user: ${user.username}`);

        return successResponse(res, null, 'Password changed successfully');

    } catch (error) {
        next(error);
    }
};

/**
 * Reset password (admin only)
 * @route POST /api/auth/reset-password/:userId
 */
const resetPassword = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        // Validate password strength
        if (!newPassword || newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await User.updatePassword(userId, passwordHash);

        logger.info(`Password reset by admin for user: ${user.username}`);

        return successResponse(res, null, 'Password reset successfully');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    refresh,
    getCurrentUser,
    changePassword,
    resetPassword
};
