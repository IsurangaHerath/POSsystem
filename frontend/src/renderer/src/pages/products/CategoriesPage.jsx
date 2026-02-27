/**
 * Categories Page
 * 
 * Product category management
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

// Components
import Modal from '../../components/common/Modal';

const CategoriesPage = () => {
    const { hasMinRole } = useAuth();
    const { success, error } = useToast();

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canEdit = hasMinRole('manager');

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data.data || []);
        } catch (err) {
            error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    }, [error]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Category name is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open add modal
    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    // Open edit modal
    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setShowModal(true);
    };

    // Save category
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
                success('Category updated successfully');
            } else {
                await api.post('/categories', formData);
                success('Category created successfully');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete category
    const handleDelete = async () => {
        try {
            await api.delete(`/categories/${deletingCategory.id}`);
            success('Category deleted successfully');
            setShowDeleteModal(false);
            fetchCategories();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {categories.length} categories
                    </p>
                </div>
                {canEdit && (
                    <button onClick={handleAdd} className="btn btn-primary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                    </button>
                )}
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                    {canEdit && (
                        <button onClick={handleAdd} className="btn btn-primary mt-4">
                            Create First Category
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category.id} className="card p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {category.name}
                                    </h3>
                                    {category.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {category.description}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        {category.product_count || 0} products
                                    </p>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingCategory(category);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <div className="p-6 space-y-4">
                    <div>
                        <label className="form-label">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                            placeholder="Category name"
                        />
                        {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                    </div>
                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="form-input"
                            placeholder="Category description (optional)"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Category"
            >
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?
                        Products in this category will be uncategorized.
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleDelete} className="btn btn-danger">
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
