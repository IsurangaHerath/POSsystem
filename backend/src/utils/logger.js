/**
 * Logger Configuration
 * 
 * Winston logger setup with console and file transports.
 * Provides structured logging with different levels and formats.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add metadata if present
        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }

        // Add stack trace for errors
        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

// Console format with colors
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let log = `${timestamp} [${level}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }

        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: consoleFormat,
            handleExceptions: true,
            handleRejections: true
        }),

        // All logs file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Error logs file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    exitOnError: false
});

// Add request logging helper
logger.logRequest = (req, statusCode, duration) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || 'anonymous'
    };

    if (statusCode >= 400) {
        logger.warn('HTTP Request', logData);
    } else {
        logger.info('HTTP Request', logData);
    }
};

// Add database query logging helper
logger.logQuery = (sql, duration, error = null) => {
    const logData = {
        sql: sql.substring(0, 200),
        duration: `${duration}ms`
    };

    if (error) {
        logger.error('Database Query Error', { ...logData, error: error.message });
    } else if (duration > 100) {
        logger.warn('Slow Query', logData);
    } else {
        logger.debug('Database Query', logData);
    }
};

module.exports = logger;
