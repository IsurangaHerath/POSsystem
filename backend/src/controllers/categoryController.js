/**
 * Category Controller
 * 
 * Handles category management operations.
 */

const Category = require('../models/Category');
const { successResponse, createdResponse, notFoundResponse } = require('../utils/response');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all categories
 * @route GET /api/categories
 */
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAllTree();

        return successResponse(res, categories);
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by ID
 * @route GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return successResponse(res, category);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new category
 * @route POST /api/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description, parent_id } = req.body;

        // Check if category name already exists
        const nameExists = await Category.nameExists(name);
        if (nameExists) {
            throw new ConflictError('Category name already exists');
        }

        // Create category
        const categoryId = await Category.create({
            name,
            description,
            parent_id
        });

        // Get created category
        const category = await Category.findById(categoryId);

        logger.info(`Category created: ${name} by ${req.user.username}`);

        return createdResponse(res, category, 'Category created successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Update category
 * @route PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, parent_id, is_active } = req.body;

        // Check if category exists
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            throw new NotFoundError('Category not found');
        }

        // Check if name is being changed and if it already exists
        if (name && name !== existingCategory.name) {
            const nameExists = await Category.nameExists(name, parseInt(id));
            if (nameExists) {
                throw new ConflictError('Category name already exists');
            }
        }

        // Prevent setting parent to self
        if (parent_id && parseInt(parent_id) === parseInt(id)) {
            throw new ConflictError('Category cannot be its own parent');
        }

        // Update category
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (parent_id !== undefined) updateData.parent_id = parent_id;
        if (is_active !== undefined) updateData.is_active = is_active;

        await Category.update(id, updateData);

        // Get updated category
        const category = await Category.findById(id);

        logger.info(`Category updated: ${category.name} by ${req.user.username}`);

        return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Check if category has products
        const hasProducts = await Category.hasProducts(id);
        if (hasProducts) {
            throw new ConflictError('Cannot delete category with products. Remove products first or reassign them.');
        }

        // Check if category has children
        const hasChildren = await Category.hasChildren(id);
        if (hasChildren) {
            throw new ConflictError('Cannot delete category with subcategories. Delete subcategories first.');
        }

        // Delete category
        await Category.delete(id);

        logger.info(`Category deleted: ${category.name} by ${req.user.username}`);

        return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
