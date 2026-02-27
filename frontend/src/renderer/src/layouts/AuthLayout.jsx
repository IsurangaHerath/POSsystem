/**
 * Auth Layout
 * 
 * Layout for authentication pages (login)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 dark:from-gray-900 dark:to-gray-800 px-4">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
