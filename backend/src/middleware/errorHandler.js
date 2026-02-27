/**
 * Error Handler Middleware
 * 
 * Global error handling middleware for consistent error responses.
 * Catches all errors and returns standardized error format.
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true; // Distinguishes operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404, ERROR_CODES.NOT_FOUND);
    }
}

/**
 * Validation Error (400)
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
    }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication failed') {
        super(message, 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
    constructor(message = 'Resource conflict') {
        super(message, 409, ERROR_CODES.CONFLICT_ERROR);
    }
}

/**
 * Database Error (500)
 */
class DatabaseError extends ApiError {
    constructor(message = 'Database operation failed') {
        super(message, 500, ERROR_CODES.DATABASE_ERROR);
    }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends ApiError {
    constructor(message = 'Too many requests') {
        super(message, 429, ERROR_CODES.RATE_LIMIT_ERROR);
    }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    const errorInfo = {
        message: err.message,
        code: err.code || ERROR_CODES.INTERNAL_ERROR,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.id || 'anonymous',
        ip: req.ip || req.connection.remoteAddress
    };

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Log based on error severity
    if (statusCode >= 500) {
        logger.error('Server Error:', errorInfo);
    } else if (statusCode >= 400) {
        logger.warn('Client Error:', {
            message: err.message,
            code: err.code,
            url: req.originalUrl,
            user: req.user?.id
        });
    }

    // Handle specific error types
    if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
        return errorResponse(res, 'Invalid JSON in request body', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        const match = err.message.match(/Duplicate entry '(.+)' for key/);
        const value = match ? match[1] : 'unknown';
        return errorResponse(
            res,
            `Duplicate entry: ${value} already exists`,
            ERROR_CODES.CONFLICT_ERROR,
            409
        );
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return errorResponse(
            res,
            'Referenced record not found',
            ERROR_CODES.VALIDATION_ERROR,
            400
        );
    }

    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return errorResponse(
            res,
            'Cannot delete: record is referenced by other records',
            ERROR_CODES.CONFLICT_ERROR,
            409
        );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', ERROR_CODES.AUTHENTICATION_ERROR, 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired', ERROR_CODES.AUTHENTICATION_ERROR, 401);
    }

    // Operational errors (trusted, can be sent to client)
    if (err.isOperational) {
        return errorResponse(res, err.message, err.code, statusCode, err.details);
    }

    // Programming errors (don't leak details)
    if (process.env.NODE_ENV === 'production') {
        return errorResponse(res, 'An unexpected error occurred', ERROR_CODES.INTERNAL_ERROR, 500);
    }

    // Development: send full error details
    return res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || ERROR_CODES.INTERNAL_ERROR,
            message: err.message,
            stack: err.stack,
            details: err.details
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    ApiError,
    NotFoundError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    DatabaseError,
    RateLimitError
};
