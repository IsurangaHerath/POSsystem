const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../utils/constants');

class ApiError extends Error {
    constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404, ERROR_CODES.NOT_FOUND);
    }
}

class ValidationError extends ApiError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
    }
}

class AuthenticationError extends ApiError {
    constructor(message = 'Authentication failed') {
        super(message, 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }
}

class AuthorizationError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
}

class ConflictError extends ApiError {
    constructor(message = 'Resource conflict') {
        super(message, 409, ERROR_CODES.CONFLICT_ERROR);
    }
}

class DatabaseError extends ApiError {
    constructor(message = 'Database operation failed') {
        super(message, 500, ERROR_CODES.DATABASE_ERROR);
    }
}

class RateLimitError extends ApiError {
    constructor(message = 'Too many requests') {
        super(message, 429, ERROR_CODES.RATE_LIMIT_ERROR);
    }
}

const errorHandler = (err, req, res, next) => {
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

    const statusCode = err.statusCode || 500;

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

    if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
        return errorResponse(res, 'Invalid JSON in request body', ERROR_CODES.VALIDATION_ERROR, 400);
    }

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

    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', ERROR_CODES.AUTHENTICATION_ERROR, 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired', ERROR_CODES.AUTHENTICATION_ERROR, 401);
    }

    if (err.isOperational) {
        return errorResponse(res, err.message, err.code, statusCode, err.details);
    }

    if (process.env.NODE_ENV === 'production') {
        return errorResponse(res, 'An unexpected error occurred', ERROR_CODES.INTERNAL_ERROR, 500);
    }

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

const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

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
