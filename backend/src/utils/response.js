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

const validationError = (res, errors) => {
    const formattedErrors = errors.map(error => ({
        field: error.path || error.param,
        message: error.msg
    }));

    return errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, formattedErrors);
};

const notFoundResponse = (res, resource = 'Resource') => {
    return errorResponse(res, `${resource} not found`, 'NOT_FOUND', 404);
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, 'AUTHENTICATION_ERROR', 401);
};

const forbiddenResponse = (res, message = 'Access denied') => {
    return errorResponse(res, message, 'AUTHORIZATION_ERROR', 403);
};

const conflictResponse = (res, message = 'Resource conflict') => {
    return errorResponse(res, message, 'CONFLICT_ERROR', 409);
};

const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

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
