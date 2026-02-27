/**
 * Stat Card Component
 * 
 * Displays a single statistic with icon and optional alert styling
 */

import React from 'react';

const StatCard = ({ title, value, subtitle, icon, color, alert }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    };

    return (
        <div className={`card p-6 ${alert ? 'ring-2 ring-red-500' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            {alert && (
                <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Attention needed
                </div>
            )}
        </div>
    );
};

export default StatCard;
