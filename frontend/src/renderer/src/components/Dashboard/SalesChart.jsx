/**
 * Sales Chart Component
 * 
 * Displays sales data in a line/bar chart
 */

import React, { useState } from 'react';

const SalesChart = ({ data }) => {
    const [chartType, setChartType] = useState('daily'); // daily, weekly, monthly

    // Sample data if no data provided
    const chartData = data.length > 0 ? data : [
        { label: 'Mon', value: 1200 },
        { label: 'Tue', value: 1900 },
        { label: 'Wed', value: 1500 },
        { label: 'Thu', value: 2100 },
        { label: 'Fri', value: 2400 },
        { label: 'Sat', value: 2800 },
        { label: 'Sun', value: 1600 }
    ];

    // Calculate max value for scaling
    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sales Overview
                </h3>
                <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${chartType === type
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="card-body">
                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-64">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col items-center justify-end h-full">
                                {/* Value label */}
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    ${item.value.toLocaleString()}
                                </span>
                                {/* Bar */}
                                <div
                                    className="w-full max-w-[40px] bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                                    style={{
                                        height: `${(item.value / maxValue) * 200}px`,
                                        minHeight: '4px'
                                    }}
                                />
                            </div>
                            {/* Label */}
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Peak</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${Math.max(...chartData.map(d => d.value)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;
