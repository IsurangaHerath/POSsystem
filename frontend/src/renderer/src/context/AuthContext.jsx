import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
};

const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: 3,
    [ROLES.MANAGER]: 2,
    [ROLES.CASHIER]: 1
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (window.electron?.store) {
                    const storedToken = await window.electron.store.get('auth_token');
                    const storedUser = await window.electron.store.get('auth_user');

                    if (storedToken && storedUser) {
                        setToken(storedToken);
                        setUser(storedUser);
                        setIsAuthenticated(true);

                        try {
                            const response = await api.get('/auth/me');
                            setUser(response.data.data.user);
                            await window.electron.store.set('auth_user', response.data.data.user);
                        } catch (error) {
                            await logout();
                        }
                    }
                } else {
                    const storedToken = localStorage.getItem('auth_token');
                    const storedUser = localStorage.getItem('auth_user');

                    if (storedToken && storedUser) {
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);

                        try {
                            const response = await api.get('/auth/me');
                            setUser(response.data.data.user);
                            localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
                        } catch (error) {
                            await logout();
                        }
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });

            const responseData = response.data.data;
            let userData, authToken;
            
            if (responseData.tokens) {
                userData = responseData.user;
                authToken = responseData.tokens.accessToken;
            } else {
                userData = responseData.user;
                authToken = responseData.token;
            }

            if (window.electron?.store) {
                await window.electron.store.set('auth_token', authToken);
                await window.electron.store.set('auth_user', userData);
            } else {
                localStorage.setItem('auth_token', authToken);
                localStorage.setItem('auth_user', JSON.stringify(userData));
            }

            setToken(authToken);
            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
        } finally {
            if (window.electron?.store) {
                await window.electron.store.delete('auth_token');
                await window.electron.store.delete('auth_user');
            } else {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }

            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const hasRole = useCallback((requiredRole) => {
        if (!user) return false;
        return user.role === requiredRole;
    }, [user]);

    const hasMinRole = useCallback((requiredRole) => {
        if (!user) return false;
        const userLevel = ROLE_HIERARCHY[user.role] || 0;
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
        return userLevel >= requiredLevel;
    }, [user]);

    const hasPermission = useCallback((permission) => {
        if (!user) return false;

        if (user.role === ROLES.ADMIN) return true;

        const permissions = {
            [ROLES.MANAGER]: [
                'view_dashboard',
                'view_products', 'create_products', 'edit_products',
                'view_categories', 'create_categories', 'edit_categories',
                'view_sales', 'create_sales',
                'view_inventory', 'adjust_inventory',
                'view_suppliers', 'create_suppliers', 'edit_suppliers',
                'view_purchase_orders', 'create_purchase_orders',
                'view_reports', 'export_reports'
            ],
            [ROLES.CASHIER]: [
                'view_products',
                'view_sales', 'create_sales'
            ]
        };

        const userPermissions = permissions[user.role] || [];
        return userPermissions.includes(permission);
    }, [user]);

    const updateProfile = useCallback(async (updates) => {
        try {
            const response = await api.put('/auth/profile', updates);
            const updatedUser = response.data.data.user;

            setUser(updatedUser);

            if (window.electron?.store) {
                await window.electron.store.set('auth_user', updatedUser);
            } else {
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            }

            return { success: true, user: updatedUser };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            return { success: false, error: message };
        }
    }, []);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            await api.put('/auth/password', { currentPassword, newPassword });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password';
            return { success: false, error: message };
        }
    }, []);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasMinRole,
        hasPermission,
        updateProfile,
        changePassword,
        isAdmin: user?.role === ROLES.ADMIN,
        isManager: user?.role === ROLES.MANAGER,
        isCashier: user?.role === ROLES.CASHIER
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
