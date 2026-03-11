/**
 * Inventory Controller
 * 
 * Handles inventory management operations.
 */

const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { successResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get inventory status for all products
 * @route GET /api/inventory
 */
const getInventory = async (req, res, next) => {
    try {
        logger.info('GET /api/inventory called', { query: req.query });
        
        const {
            page = 1,
            limit = 20,
            low_stock,
            category_id,
            search
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            low_stock: low_stock === 'true',
            category_id,
            search
        };

        logger.info('Fetching inventory with options:', options);
        const { inventory, pagination } = await Inventory.findAll(options);
        logger.info('Inventory fetched successfully:', { count: inventory?.length });

        return paginatedResponse(res, inventory, pagination);
    } catch (error) {
        logger.error('Error fetching inventory:', error);
        next(error);
    }
};

/**
 * Get inventory change logs
 * @route GET /api/inventory/logs
 */
const getInventoryLogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            product_id,
            transaction_type,
            startDate,
            endDate
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            product_id,
            transaction_type,
            startDate,
            endDate
        };

        const { logs, pagination } = await Inventory.getLogs(options);

        return paginatedResponse(res, logs, pagination);
    } catch (error) {
        next(error);
    }
};

/**
 * Adjust inventory manually
 * @route POST /api/inventory/adjust
 */
const adjustInventory = async (req, res, next) => {
    try {
        const { product_id, adjustment_type, quantity, notes } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findById(product_id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Calculate quantity change
        let quantityChange;
        switch (adjustment_type) {
            case 'add':
                quantityChange = quantity;
                break;
            case 'subtract':
                quantityChange = -quantity;
                break;
            case 'set':
                quantityChange = quantity - product.quantity_in_stock;
                break;
            default:
                throw new ValidationError('Invalid adjustment type');
        }

        // Check if subtracting more than available
        if (product.quantity_in_stock + quantityChange < 0) {
            throw new ValidationError('Insufficient stock for this adjustment');
        }

        // Update stock
        await Product.updateStock(product_id, quantityChange);

        // Log the change
        await Inventory.logChange({
            product_id,
            transaction_type: 'adjustment',
            quantity_change: quantityChange,
            quantity_before: product.quantity_in_stock,
            quantity_after: product.quantity_in_stock + quantityChange,
            user_id: userId,
            notes: notes || `Manual ${adjustment_type}: ${quantity}`
        });

        // Get updated product
        const updatedProduct = await Product.findById(product_id);

        logger.info(`Inventory adjusted for ${product.name}: ${quantityChange >= 0 ? '+' : ''}${quantityChange} by ${req.user.username}`);

        return successResponse(res, {
            product_id,
            quantity_before: product.quantity_in_stock,
            quantity_after: updatedProduct.quantity_in_stock,
            adjustment: quantityChange
        }, 'Inventory adjusted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInventory,
    getInventoryLogs,
    adjustInventory
};
