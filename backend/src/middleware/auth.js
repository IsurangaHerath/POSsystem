/**
 * Authentication Middleware
 * 
 * JWT token verification and user authentication middleware.
 * Validates tokens and attaches user information to requests.
 */

const jwt = require('jsonwebtoken');
const { unauthorizedResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token middleware
 * Attaches user information to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse(res, 'No token provided');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return unauthorizedResponse(res, 'Invalid token format');
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
            full_name: decoded.full_name
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return unauthorizedResponse(res, 'Token has expired');
        }

        if (error.name === 'JsonWebTokenError') {
            return unauthorizedResponse(res, 'Invalid token');
        }

        logger.error('Authentication error:', error);
        return errorResponse(res, 'Authentication failed', 'AUTHENTICATION_ERROR', 401);
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            if (token) {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = {
                    id: decoded.id,
                    username: decoded.username,
                    email: decoded.email,
                    role: decoded.role,
                    full_name: decoded.full_name
                };
            }
        }

        next();
    } catch (error) {
        // Silently continue without user info
        next();
    }
};

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object|null} Decoded token or null
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};
