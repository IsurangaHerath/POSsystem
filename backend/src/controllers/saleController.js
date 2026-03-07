const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const db = require('../config/database');

const getSales = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            status,
            payment_method,
            user_id
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            startDate,
            endDate,
            status,
            payment_method,
            user_id
        };

        const { sales, pagination } = await Sale.findAll(options);

        return paginatedResponse(res, sales, pagination);
    } catch (error) {
        next(error);
    }
};

const getSaleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sale = await Sale.findByIdWithItems(id);

        if (!sale) {
            throw new NotFoundError('Sale not found');
        }

        return successResponse(res, sale);
    } catch (error) {
        next(error);
    }
};

const createSale = async (req, res, next) => {
    try {
        const { items, payment_method, amount_paid, discount_amount = 0, notes } = req.body;
        const userId = req.user.id;

        if (!items || items.length === 0) {
            throw new ValidationError('At least one item is required');
        }

        const connection = await db.beginTransaction();

        try {
            let subtotal = 0;
            let totalTax = 0;
            const saleItems = [];

            for (const item of items) {
                const product = await Product.findById(item.product_id);

                if (!product) {
                    throw new NotFoundError(`Product with ID ${item.product_id} not found`);
                }

                if (product.quantity_in_stock < item.quantity) {
                    throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.quantity_in_stock}`);
                }

                const itemSubtotal = product.selling_price * item.quantity;
                const itemTax = (itemSubtotal * (product.tax_rate || 0)) / 100;
                const itemDiscount = item.discount || 0;

                subtotal += itemSubtotal;
                totalTax += itemTax;

                saleItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    product_barcode: product.barcode,
                    unit_price: product.selling_price,
                    quantity: item.quantity,
                    subtotal: itemSubtotal,
                    discount: itemDiscount,
                    tax_amount: itemTax
                });
            }

            const totalAmount = subtotal + totalTax - discount_amount;
            const changeAmount = amount_paid - totalAmount;

            const invoiceNumber = await Sale.generateInvoiceNumber();

            const saleId = await Sale.create({
                invoice_number: invoiceNumber,
                user_id: userId,
                subtotal,
                tax_amount: totalTax,
                discount_amount,
                total_amount: totalAmount,
                payment_method,
                amount_paid,
                change_amount: changeAmount > 0 ? changeAmount : 0,
                notes
            });

            for (const saleItem of saleItems) {
                await Sale.createItem(saleId, saleItem);
                await Product.updateStock(saleItem.product_id, -saleItem.quantity);

                await Sale.logInventoryChange(
                    saleItem.product_id,
                    -saleItem.quantity,
                    saleId,
                    'sale',
                    userId
                );
            }

            await db.commitTransaction(connection);

            const sale = await Sale.findByIdWithItems(saleId);

            logger.info(`Sale created: ${invoiceNumber} by ${req.user.username}`);

            return createdResponse(res, sale, 'Sale completed successfully');
        } catch (error) {
            await db.rollbackTransaction(connection);
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

const voidSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const sale = await Sale.findById(id);
        if (!sale) {
            throw new NotFoundError('Sale not found');
        }

        if (sale.status === 'voided') {
            throw new ConflictError('Sale is already voided');
        }

        const connection = await db.beginTransaction();

        try {
            await Sale.voidSale(id);

            const items = await Sale.getSaleItems(id);
            for (const item of items) {
                await Product.updateStock(item.product_id, item.quantity);

                await Sale.logInventoryChange(
                    item.product_id,
                    item.quantity,
                    id,
                    'return',
                    req.user.id,
                    `Voided sale: ${reason}`
                );
            }

            await db.commitTransaction(connection);

            logger.info(`Sale voided: ${sale.invoice_number} by ${req.user.username}. Reason: ${reason}`);

            return successResponse(res, { id, status: 'voided' }, 'Sale voided successfully');
        } catch (error) {
            await db.rollbackTransaction(connection);
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

const generateInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sale = await Sale.findByIdWithItems(id);

        if (!sale) {
            throw new NotFoundError('Sale not found');
        }

        res.setHeader('Content-Type', 'application/json');
        return res.json({
            success: true,
            message: 'Invoice data',
            data: sale
        });
    } catch (error) {
        next(error);
    }
};

const generateReceipt = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sale = await Sale.findByIdWithItems(id);

        if (!sale) {
            throw new NotFoundError('Sale not found');
        }

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.invoice_number}</title>
        <style>
          body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 10px; }
          .header { text-align: center; margin-bottom: 10px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; }
          .total { font-weight: bold; }
          .footer { text-align: center; margin-top: 10px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>POS System Store</h2>
          <p>123 Main Street, City</p>
        </div>
        <div class="divider"></div>
        <p>Invoice: ${sale.invoice_number}</p>
        <p>Date: ${new Date(sale.sale_date).toLocaleString()}</p>
        <p>Cashier: ${sale.cashier_name}</p>
        <div class="divider"></div>
        ${sale.items.map(item => `
          <div class="item">
            <span>${item.product_name} x${item.quantity}</span>
            <span>$${item.subtotal.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="item"><span>Subtotal:</span><span>$${sale.subtotal.toFixed(2)}</span></div>
        <div class="item"><span>Tax:</span><span>$${sale.tax_amount.toFixed(2)}</span></div>
        ${sale.discount_amount > 0 ? `<div class="item"><span>Discount:</span><span>-$${sale.discount_amount.toFixed(2)}</span></div>` : ''}
        <div class="item total"><span>Total:</span><span>$${sale.total_amount.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="item"><span>Paid (${sale.payment_method}):</span><span>$${sale.amount_paid.toFixed(2)}</span></div>
        ${sale.change_amount > 0 ? `<div class="item"><span>Change:</span><span>$${sale.change_amount.toFixed(2)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
        </div>
      </body>
      </html>
    `;

        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSales,
    getSaleById,
    createSale,
    voidSale,
    generateInvoice,
    generateReceipt
};
