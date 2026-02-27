/**
 * User Controller
 * 
 * Handles user management operations.
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { successResponse, createdResponse, paginatedResponse, notFoundResponse, errorResponse } = require('../utils/response');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Salt rounds for bcrypt
const SALT_ROUNDS = 12;

/**
 * Get all users with pagination
 * @route GET /api/users
 */
const getUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            is_active,
            search,
            sortBy,
            sortOrder
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            role,
            is_active: is_active !== undefined ? is_active === 'true' : null,
            search,
            sortBy,
            sortOrder
        };

        const { users, pagination } = await User.findAll(options);

        return paginatedResponse(res, users, pagination);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new user
 * @route POST /api/users
 */
const createUser = async (req, res, next) => {
    try {
        const { username, email, password, full_name, role, phone } = req.body;

        // Check if username already exists
        const usernameExists = await User.usernameExists(username);
        if (usernameExists) {
            throw new ConflictError('Username already exists');
        }

        // Check if email already exists
        const emailExists = await User.emailExists(email);
        if (emailExists) {
            throw new ConflictError('Email already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const userId = await User.create({
            username,
            email,
            password_hash,
            full_name,
            role,
            phone
        });

        // Get created user
        const user = await User.findById(userId);

        logger.info(`User created: ${username} by ${req.user.username}`);

        return createdResponse(res, user, 'User created successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Update user
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, full_name, role, phone, is_active } = req.body;

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            throw new NotFoundError('User not found');
        }

        // Check if username is being changed and if it already exists
        if (username && username !== existingUser.username) {
            const usernameExists = await User.usernameExists(username, parseInt(id));
            if (usernameExists) {
                throw new ConflictError('Username already exists');
            }
        }

        // Check if email is being changed and if it already exists
        if (email && email !== existingUser.email) {
            const emailExists = await User.emailExists(email, parseInt(id));
            if (emailExists) {
                throw new ConflictError('Email already exists');
            }
        }

        // Build update data
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (full_name) updateData.full_name = full_name;
        if (role) updateData.role = role;
        if (phone !== undefined) updateData.phone = phone;
        if (is_active !== undefined) updateData.is_active = is_active;

        // Update user
        await User.update(id, updateData);

        // Get updated user
        const user = await User.findById(id);

        logger.info(`User updated: ${user.username} by ${req.user.username}`);

        return successResponse(res, user, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (soft delete)
 * @route DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Prevent deleting yourself
        if (parseInt(id) === req.user.id) {
            throw new ValidationError('Cannot delete your own account');
        }

        // Soft delete user
        await User.delete(id);

        logger.info(`User deleted: ${user.username} by ${req.user.username}`);

        return successResponse(res, null, 'User deactivated successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
