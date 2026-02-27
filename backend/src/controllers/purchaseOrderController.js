/**
 * Purchase Order Controller
 * 
 * Handles purchase order operations.
 */

const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Get all purchase orders
 * @route GET /api/purchase-orders
 */
const getPurchaseOrders = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            supplier_id
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            supplier_id
        };

        const { purchaseOrders, pagination } = await PurchaseOrder.findAll(options);

        return paginatedResponse(res, purchaseOrders, pagination);
    } catch (error) {
        next(error);
    }
};

/**
 * Get purchase order by ID
 * @route GET /api/purchase-orders/:id
 */
const getPurchaseOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findByIdWithItems(id);

        if (!purchaseOrder) {
            throw new NotFoundError('Purchase order not found');
        }

        return successResponse(res, purchaseOrder);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new purchase order
 * @route POST /api/purchase-orders
 */
const createPurchaseOrder = async (req, res, next) => {
    try {
        const { supplier_id, items, expected_date, notes } = req.body;
        const userId = req.user.id;

        // Validate items
        if (!items || items.length === 0) {
            throw new ValidationError('At least one item is required');
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                throw new NotFoundError(`Product with ID ${item.product_id} not found`);
            }

            const itemSubtotal = item.unit_cost * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product_id: product.id,
                unit_cost: item.unit_cost,
                quantity_ordered: item.quantity,
                quantity_received: 0,
                subtotal: itemSubtotal
            });
        }

        // Generate PO number
        const poNumber = await PurchaseOrder.generatePONumber();

        // Create purchase order
        const poId = await PurchaseOrder.create({
            po_number: poNumber,
            supplier_id,
            user_id: userId,
            subtotal,
            total_amount: subtotal, // Add tax if needed
            expected_date,
            notes
        });

        // Create PO items
        for (const orderItem of orderItems) {
            await PurchaseOrder.createItem(poId, orderItem);
        }

        // Get created PO
        const purchaseOrder = await PurchaseOrder.findByIdWithItems(poId);

        logger.info(`Purchase order created: ${poNumber} by ${req.user.username}`);

        return createdResponse(res, purchaseOrder, 'Purchase order created successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Receive purchase order items
 * @route PUT /api/purchase-orders/:id/receive
 */
const receivePurchaseOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { items, notes } = req.body;
        const userId = req.user.id;

        // Check if PO exists
        const purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            throw new NotFoundError('Purchase order not found');
        }

        if (purchaseOrder.status === 'cancelled') {
            throw new ValidationError('Cannot receive cancelled purchase order');
        }

        // Start transaction
        const connection = await db.beginTransaction();

        try {
            // Process received items
            for (const item of items) {
                const poItem = await PurchaseOrder.findItem(id, item.product_id);

                if (!poItem) {
                    throw new NotFoundError(`Item not found in purchase order`);
                }

                const qtyReceived = item.quantity_received;
                const qtyDiff = qtyReceived - poItem.quantity_received;

                if (qtyDiff > 0) {
                    // Update product stock
                    await Product.updateStock(item.product_id, qtyDiff);

                    // Log inventory change
                    await PurchaseOrder.logInventoryChange(
                        item.product_id,
                        qtyDiff,
                        id,
                        userId
                    );
                }

                // Update PO item
                await PurchaseOrder.updateItemReceived(id, item.product_id, qtyReceived);
            }

            // Check if all items received
            const allItems = await PurchaseOrder.getItems(id);
            const allReceived = allItems.every(
                item => item.quantity_received >= item.quantity_ordered
            );

            // Update PO status
            const newStatus = allReceived ? 'received' : 'approved';
            await PurchaseOrder.updateStatus(id, newStatus, allReceived ? new Date() : null);

            await db.commitTransaction(connection);

            // Get updated PO
            const updatedPO = await PurchaseOrder.findByIdWithItems(id);

            logger.info(`Purchase order received: ${purchaseOrder.po_number} by ${req.user.username}`);

            return successResponse(res, updatedPO, 'Purchase order received successfully');
        } catch (error) {
            await db.rollbackTransaction(connection);
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel purchase order
 * @route PUT /api/purchase-orders/:id/cancel
 */
const cancelPurchaseOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Check if PO exists
        const purchaseOrder = await PurchaseOrder.findById(id);
        if (!purchaseOrder) {
            throw new NotFoundError('Purchase order not found');
        }

        if (purchaseOrder.status === 'received') {
            throw new ValidationError('Cannot cancel received purchase order');
        }

        // Cancel PO
        await PurchaseOrder.updateStatus(id, 'cancelled');

        logger.info(`Purchase order cancelled: ${purchaseOrder.po_number} by ${req.user.username}. Reason: ${reason}`);

        return successResponse(res, { id, status: 'cancelled' }, 'Purchase order cancelled successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder
};
