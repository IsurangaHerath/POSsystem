/**
 * Users Page (Admin Only)
 * 
 * User management with CRUD operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Components
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const UsersPage = () => {
    const { success, error } = useToast();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'cashier',
        is_active: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                search: searchTerm,
                role: roleFilter
            };
            const response = await api.get('/users', { params });
            setUsers(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (err) {
            error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, roleFilter, error]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle form change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) errors.username = 'Username is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
        if (!editingUser && !formData.password) errors.password = 'Password is required';
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Open add modal
    const handleAdd = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            full_name: '',
            password: '',
            role: 'cashier',
            is_active: true
        });
        setShowModal(true);
    };

    // Open edit modal
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            password: '',
            role: user.role,
            is_active: user.is_active
        });
        setShowModal(true);
    };

    // Save user
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const submitData = { ...formData };
            if (editingUser && !submitData.password) {
                delete submitData.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, submitData);
                success('User updated successfully');
            } else {
                await api.post('/users', submitData);
                success('User created successfully');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle user status
    const toggleUserStatus = async (user) => {
        try {
            await api.put(`/users/${user.id}`, { is_active: !user.is_active });
            success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch (err) {
            error('Failed to update user status');
        }
    };

    // Get role badge
    const getRoleBadge = (role) => {
        const badges = {
            admin: 'badge-danger',
            manager: 'badge-primary',
            cashier: 'badge-success'
        };
        return badges[role] || 'badge-gray';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage system users
                    </p>
                </div>
                <button onClick={handleAdd} className="btn btn-primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input pl-10"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="form-input w-40"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                        {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.full_name || user.username}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        @{user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-600 dark:text-gray-300">{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-gray-500 dark:text-gray-400 text-sm">
                                            {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => toggleUserStatus(user)}
                                                    className={`p-2 rounded-lg ${user.is_active
                                                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {user.is_active ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        )}
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Edit User' : 'Add User'}
            >
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Username *</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`form-input ${formErrors.username ? 'border-red-500' : ''}`}
                                placeholder="Username"
                            />
                            {formErrors.username && <p className="form-error">{formErrors.username}</p>}
                        </div>
                        <div>
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                                placeholder="email@example.com"
                            />
                            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className={`form-input ${formErrors.full_name ? 'border-red-500' : ''}`}
                                placeholder="Full name"
                            />
                            {formErrors.full_name && <p className="form-error">{formErrors.full_name}</p>}
                        </div>
                        <div>
                            <label className="form-label">
                                Password {editingUser && '(leave blank to keep current)'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${formErrors.password ? 'border-red-500' : ''}`}
                                placeholder="Password"
                            />
                            {formErrors.password && <p className="form-error">{formErrors.password}</p>}
                        </div>
                        <div>
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="cashier">Cashier</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Active user</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersPage;
