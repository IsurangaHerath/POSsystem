const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/response');
const { AuthenticationError, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByUsernameOrEmail(username);

        if (!user) {
            logger.warn(`Login failed - invalid username: ${username}`);
            throw new AuthenticationError('Invalid username or password');
        }

        if (!user.is_active) {
            logger.warn(`Login attempt on inactive account: ${username}`);
            throw new AuthenticationError('Account is deactivated. Please contact administrator.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            logger.warn(`Wrong password for user: ${username}`);
            throw new AuthenticationError('Invalid username or password');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await User.updateLastLogin(user.id);

        logger.info(`User logged in: ${username}`);

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

const logout = async (req, res, next) => {
    try {
        if (req.user) {
            logger.info(`User logged out: ${req.user.username}`);
        }

        return successResponse(res, null, 'Logout successful');
    } catch (error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AuthenticationError('Refresh token is required');
        }

        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            throw new AuthenticationError('Invalid or expired refresh token');
        }

        const user = await User.findById(decoded.id);

        if (!user || !user.is_active) {
            throw new AuthenticationError('User not found or inactive');
        }

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

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        if (newPassword !== confirmPassword) {
            throw new ValidationError('New passwords do not match');
        }

        if (newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const fullUser = await User.findByUsername(user.username);

        const isPasswordValid = await bcrypt.compare(currentPassword, fullUser.password_hash);

        if (!isPasswordValid) {
            throw new AuthenticationError('Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await User.updatePassword(userId, newPasswordHash);

        logger.info(`Password changed for user: ${user.username}`);

        return successResponse(res, null, 'Password changed successfully');

    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long');
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

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
