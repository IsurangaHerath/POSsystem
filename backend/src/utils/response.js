/**
 * API Response Helpers
 * 
 * Standardized response format for all API endpoints.
 * Provides consistent success and error response structures.
 */

/**
 * Success response structure
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Error response structure
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @param {Array} details - Error details
 */
const errorResponse = (res, message = 'An error occurred', code = 'INTERNAL_ERROR', statusCode = 500, details = null) => {
    const response = {
        success: false,
        error: {
            code,
            message
        },
        timestamp: new Date().toISOString()
    };

    if (details) {
        response.error.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Paginated response structure
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 0
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors from express-validator
 */
const validationError = (res, errors) => {
    const formattedErrors = errors.map(error => ({
        field: error.path || error.param,
        message: error.msg
    }));

    return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, formattedErrors);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
const notFoundResponse = (res, resource = 'Resource') => {
    return errorResponse(res, `${resource} not found`, 'NOT_FOUND', 404);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, 'AUTHENTICATION_ERROR', 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = 'Access denied') => {
    return errorResponse(res, message, 'AUTHORIZATION_ERROR', 403);
};

/**
 * Conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = 'Resource conflict') => {
    return errorResponse(res, message, 'CONFLICT_ERROR', 409);
};

/**
 * Created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * No content response (for deletions)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const noContentResponse = (res, message = 'Resource deleted successfully') => {
    return successResponse(res, null, message, 200);
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
    validationError,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    conflictResponse,
    createdResponse,
    noContentResponse
};
