require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/utils/logger');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
    try {
        await db.testConnection();
        logger.info('Database connected successfully');

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

            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
