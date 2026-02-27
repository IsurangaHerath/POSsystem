/**
 * Profile Page
 * 
 * User profile management
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { success, error } = useToast();

    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Handle profile change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // Handle password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        const result = await updateProfile(profileData);

        if (result.success) {
            success('Profile updated successfully');
        } else {
            error(result.error);
        }

        setIsUpdating(false);
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            error('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);

        const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

        if (result.success) {
            success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            error(result.error);
        }

        setIsChangingPassword(false);
    };

    // Get role badge
    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            cashier: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account settings
                </p>
            </div>

            {/* Profile Card */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                </div>
                <div className="card-body">
                    {/* Avatar and basic info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                                {user?.full_name?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {user?.full_name || user?.username}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user?.role)}`}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Profile form */}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={profileData.full_name}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                value={user?.username}
                                disabled
                                className="form-input bg-gray-50 dark:bg-gray-700"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Username cannot be changed
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="form-input"
                                minLength={6}
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Minimum 6 characters
                            </p>
                        </div>
                        <div>
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Account Info */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                </div>
                <div className="card-body">
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Account Status</dt>
                            <dd>
                                <span className={`badge ${user?.is_active ? 'badge-success' : 'badge-danger'}`}>
                                    {user?.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Role</dt>
                            <dd className="text-gray-900 dark:text-white font-medium capitalize">{user?.role}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Last Login</dt>
                            <dd className="text-gray-900 dark:text-white">
                                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Account Created</dt>
                            <dd className="text-gray-900 dark:text-white">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
