const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }

        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

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

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            handleExceptions: true,
            handleRejections: true
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            handleExceptions: true,
            handleRejections: true,
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    exitOnError: false
});

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
