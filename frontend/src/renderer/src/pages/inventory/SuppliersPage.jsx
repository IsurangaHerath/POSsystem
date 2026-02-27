/**
 * Suppliers Page
 * 
 * Supplier management
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

// Components
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const SuppliersPage = () => {
    const { hasMinRole } = useAuth();
    const { success, error } = useToast();

    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canEdit = hasMinRole('manager');

    // Fetch suppliers
    const fetchSuppliers = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = { page: currentPage, search: searchTerm };
            const response = await api.get('/suppliers', { params });
            setSuppliers(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (err) {
            error('Failed to load suppliers');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, error]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Open add modal
    const handleAdd = () => {
        setEditingSupplier(null);
        setFormData({
            name: '',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            notes: ''
        });
        setShowModal(true);
    };

    // Open edit modal
    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            notes: supplier.notes || ''
        });
        setShowModal(true);
    };

    // Save supplier
    const handleSave = async () => {
        if (!formData.name.trim()) {
            error('Supplier name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}`, formData);
                success('Supplier updated successfully');
            } else {
                await api.post('/suppliers', formData);
                success('Supplier created successfully');
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to save supplier');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete supplier
    const handleDelete = async (supplier) => {
        if (!window.confirm(`Delete ${supplier.name}?`)) return;

        try {
            await api.delete(`/suppliers/${supplier.id}`);
            success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to delete supplier');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your suppliers
                    </p>
                </div>
                {canEdit && (
                    <button onClick={handleAdd} className="btn btn-primary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Supplier
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-10"
                    />
                </div>
            </div>

            {/* Suppliers Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : suppliers.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No suppliers found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="card p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {supplier.name}
                                    </h3>
                                    {supplier.contact_person && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {supplier.contact_person}
                                        </p>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(supplier)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 text-sm">
                                {supplier.email && (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Email:</span> {supplier.email}
                                    </p>
                                )}
                                {supplier.phone && (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Phone:</span> {supplier.phone}
                                    </p>
                                )}
                                {supplier.address && (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        <span className="font-medium">Address:</span> {supplier.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                size="lg"
            >
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Supplier Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Company name"
                            />
                        </div>
                        <div>
                            <label className="form-label">Contact Person</label>
                            <input
                                type="text"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Contact person name"
                            />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Phone number"
                            />
                        </div>
                        <div>
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Address"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="form-label">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="form-input"
                                placeholder="Additional notes"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SuppliersPage;
