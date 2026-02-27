/**
 * Main Application Component
 * 
 * Sets up routing and main layout structure
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Main pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import CategoriesPage from './pages/products/CategoriesPage';
import POSPage from './pages/pos/POSPage';
import SalesPage from './pages/sales/SalesPage';
import SaleDetailPage from './pages/sales/SaleDetailPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SuppliersPage from './pages/inventory/SuppliersPage';
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage';
import ReportsPage from './pages/reports/ReportsPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, hasMinRole } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasMinRole(requiredRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Products */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />

                {/* POS / Sales */}
                <Route path="/pos" element={<POSPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/:id" element={<SaleDetailPage />} />

                {/* Inventory */}
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />

                {/* Reports */}
                <Route path="/reports" element={<ReportsPage />} />

                {/* Users (Admin only) */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Settings */}
                <Route path="/settings" element={<SettingsPage />} />

                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
