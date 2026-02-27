/**
 * POS System - Backend Server Entry Point
 * 
 * This is the main entry point for the Express.js backend server.
 * It handles server initialization, database connection, and graceful shutdown.
 */

// Load environment variables first
require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/utils/logger');
const db = require('./src/config/database');

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize and start the server
 */
async function startServer() {
    try {
        // Test database connection
        await db.testConnection();
        logger.info('Database connection established successfully');

        // Start listening for requests
        const server = app.listen(PORT, () => {
            logger.info(`
╔════════════════════════════════════════════════════════════════╗
║                    POS System Backend Server                    ║
╠════════════════════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(47)}║
║  Port:        ${PORT.toString().padEnd(47)}║
║  URL:         http://localhost:${PORT}${''.padEnd(28)}║
║  API Docs:    http://localhost:${PORT}/api/docs${''.padEnd(21)}║
╚════════════════════════════════════════════════════════════════╝
      `);
        });

        // Handle graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.info(`\n${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await db.closeConnection();
                    logger.info('Database connection closed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Listen for shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
