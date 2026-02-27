/**
 * Settings Page
 * 
 * Application settings and configuration
 */

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { theme, setTheme, isDark } = useTheme();
    const { success } = useToast();
    const { user } = useAuth();

    const [settings, setSettings] = useState({
        storeName: 'My Store',
        storeAddress: '123 Main Street',
        storePhone: '(123) 456-7890',
        storeEmail: 'store@example.com',
        taxRate: 10,
        taxEnabled: true,
        currency: 'USD',
        receiptFooter: 'Thank you for your purchase!',
        lowStockThreshold: 10,
        autoPrintReceipt: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        // Save settings to electron-store or localStorage
        if (window.electron?.store) {
            window.electron.store.set('app_settings', settings);
        } else {
            localStorage.setItem('app_settings', JSON.stringify(settings));
        }
        success('Settings saved successfully');
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Configure your POS system
                </p>
            </div>

            {/* Appearance */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
                </div>
                <div className="card-body space-y-4">
                    <div>
                        <label className="form-label">Theme</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${theme === 'light'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <svg className="w-8 h-8 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="font-medium text-gray-900 dark:text-white">Light</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${theme === 'dark'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <svg className="w-8 h-8 mx-auto mb-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Information */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Information</h3>
                </div>
                <div className="card-body space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Store Name</label>
                            <input
                                type="text"
                                name="storeName"
                                value={settings.storeName}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input
                                type="tel"
                                name="storePhone"
                                value={settings.storePhone}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="storeEmail"
                                value={settings.storeEmail}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="storeAddress"
                                value={settings.storeAddress}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Settings */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Settings</h3>
                </div>
                <div className="card-body space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="taxEnabled"
                            checked={settings.taxEnabled}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable tax calculation</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Tax Rate (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={settings.taxRate}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.1"
                                className="form-input"
                                disabled={!settings.taxEnabled}
                            />
                        </div>
                        <div>
                            <label className="form-label">Currency</label>
                            <select
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="LKR">LKR (Rs)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Settings */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receipt Settings</h3>
                </div>
                <div className="card-body space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="autoPrintReceipt"
                            checked={settings.autoPrintReceipt}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto-print receipt after sale</span>
                    </label>
                    <div>
                        <label className="form-label">Receipt Footer Text</label>
                        <textarea
                            name="receiptFooter"
                            value={settings.receiptFooter}
                            onChange={handleChange}
                            rows={2}
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Settings */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Settings</h3>
                </div>
                <div className="card-body space-y-4">
                    <div>
                        <label className="form-label">Low Stock Threshold (Default)</label>
                        <input
                            type="number"
                            name="lowStockThreshold"
                            value={settings.lowStockThreshold}
                            onChange={handleChange}
                            min="0"
                            className="form-input w-48"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Products below this quantity will trigger low stock alerts
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSave} className="btn btn-primary">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
