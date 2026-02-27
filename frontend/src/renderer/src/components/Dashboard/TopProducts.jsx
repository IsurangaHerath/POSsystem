/**
 * Top Products Component
 * 
 * Displays list of top selling products
 */

import React from 'react';
import { Link } from 'react-router-dom';

const TopProducts = ({ products, formatCurrency }) => {
    // Sample data if no data provided
    const topProducts = products.length > 0 ? products : [
        { id: 1, name: 'Wireless Mouse', quantity_sold: 45, revenue: 1125 },
        { id: 2, name: 'USB Keyboard', quantity_sold: 38, revenue: 950 },
        { id: 3, name: 'Monitor Stand', quantity_sold: 32, revenue: 800 },
        { id: 4, name: 'Webcam HD', quantity_sold: 28, revenue: 700 },
        { id: 5, name: 'USB Hub', quantity_sold: 25, revenue: 625 }
    ];

    // Calculate max quantity for progress bar
    const maxQuantity = Math.max(...topProducts.map(p => p.quantity_sold), 1);

    return (
        <div className="card h-full">
            <div className="card-header flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Selling Products
                </h3>
                <Link
                    to="/reports"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View All
                </Link>
            </div>
            <div className="card-body p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topProducts.map((product, index) => (
                        <div key={product.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {product.name}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(product.revenue)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 ml-9">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(product.quantity_sold / maxQuantity) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                                    {product.quantity_sold} sold
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopProducts;
