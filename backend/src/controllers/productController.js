const Product = require('../models/Product');
const { successResponse, createdResponse, paginatedResponse, notFoundResponse } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            category_id,
            is_active,
            low_stock,
            search,
            sortBy,
            sortOrder
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category_id,
            is_active: is_active !== undefined ? is_active === 'true' : null,
            low_stock: low_stock === 'true',
            search,
            sortBy,
            sortOrder
        };

        const { products, pagination } = await Product.findAll(options);

        return paginatedResponse(res, products, pagination);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        return successResponse(res, product);
    } catch (error) {
        next(error);
    }
};

const getProductByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.params;

        const product = await Product.findByBarcode(barcode);

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        return successResponse(res, product);
    } catch (error) {
        next(error);
    }
};

const getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.getLowStock();

        return successResponse(res, products);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            barcode,
            sku,
            category_id,
            cost_price = 0,
            selling_price,
            quantity_in_stock = 0,
            reorder_level = 10,
            unit = 'piece',
            description,
            tax_rate = 0
        } = req.body;

        const skuExists = await Product.skuExists(sku);
        if (skuExists) {
            throw new ConflictError('SKU already exists');
        }

        if (barcode) {
            const barcodeExists = await Product.barcodeExists(barcode);
            if (barcodeExists) {
                throw new ConflictError('Barcode already exists');
            }
        }

        const productId = await Product.create({
            name,
            barcode,
            sku,
            category_id,
            cost_price,
            selling_price,
            quantity_in_stock,
            reorder_level,
            unit,
            description,
            tax_rate
        });

        const product = await Product.findById(productId);

        logger.info(`Product created: ${sku} by ${req.user.username}`);

        return createdResponse(res, product, 'Product created successfully');
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        if (updateData.sku && updateData.sku !== existingProduct.sku) {
            const skuExists = await Product.skuExists(updateData.sku, parseInt(id));
            if (skuExists) {
                throw new ConflictError('SKU already exists');
            }
        }

        if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
            const barcodeExists = await Product.barcodeExists(updateData.barcode, parseInt(id));
            if (barcodeExists) {
                throw new ConflictError('Barcode already exists');
            }
        }

        await Product.update(id, updateData);

        const product = await Product.findById(id);

        logger.info(`Product updated: ${product.sku} by ${req.user.username}`);

        return successResponse(res, product, 'Product updated successfully');
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            throw new NotFoundError('Product not found');
        }

        await Product.delete(id);

        logger.info(`Product deleted: ${product.sku} by ${req.user.username}`);

        return successResponse(res, null, 'Product deactivated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductByBarcode,
    getLowStockProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
