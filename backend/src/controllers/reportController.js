/**
 * Report Controller
 * 
 * Handles report generation operations.
 */

const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get daily sales report
 * @route GET /api/reports/daily-sales
 */
const getDailySalesReport = async (req, res, next) => {
    try {
        const { date } = req.query;
        const reportDate = date || new Date().toISOString().slice(0, 10);

        // Get daily summary
        const summary = await Sale.getDailySummary(reportDate);

        // Get hourly breakdown
        const hourlyBreakdown = await getHourlyBreakdown(reportDate);

        // Get payment breakdown
        const paymentBreakdown = {
            cash: {
                count: summary.cash_sales > 0 ? Math.round(summary.total_transactions * 0.4) : 0,
                amount: summary.cash_sales
            },
            card: {
                count: summary.card_sales > 0 ? Math.round(summary.total_transactions * 0.6) : 0,
                amount: summary.card_sales
            }
        };

        // Get top products for the day
        const topProducts = await Sale.getTopProducts({
            limit: 10,
            startDate: reportDate,
            endDate: reportDate
        });

        const report = {
            date: reportDate,
            summary: {
                total_transactions: summary.total_transactions,
                total_sales: summary.total_sales,
                cash_sales: summary.cash_sales,
                card_sales: summary.card_sales,
                average_transaction: summary.average_transaction,
                items_sold: topProducts.reduce((sum, p) => sum + p.total_quantity, 0)
            },
            hourly_breakdown: hourlyBreakdown,
            payment_breakdown: paymentBreakdown,
            top_products: topProducts
        };

        return successResponse(res, report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get monthly sales report
 * @route GET /api/reports/monthly-sales
 */
const getMonthlySalesReport = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        const now = new Date();
        const reportYear = parseInt(year) || now.getFullYear();
        const reportMonth = parseInt(month) || (now.getMonth() + 1);

        // Get monthly summary
        const summary = await Sale.getMonthlySummary(reportYear, reportMonth);

        // Get daily breakdown
        const dailyBreakdown = await getDailyBreakdown(reportYear, reportMonth);

        // Get weekly breakdown
        const weeklyBreakdown = await getWeeklyBreakdown(reportYear, reportMonth);

        // Get category breakdown
        const categoryBreakdown = await getCategoryBreakdown(reportYear, reportMonth);

        const report = {
            year: reportYear,
            month: reportMonth,
            summary: {
                total_transactions: summary.total_transactions,
                total_sales: summary.total_sales,
                cash_sales: summary.cash_sales,
                card_sales: summary.card_sales,
                average_daily: summary.total_sales / (dailyBreakdown.length || 1),
                average_transaction: summary.average_transaction
            },
            daily_breakdown: dailyBreakdown,
            weekly_breakdown: weeklyBreakdown,
            category_breakdown: categoryBreakdown
        };

        return successResponse(res, report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get product performance report
 * @route GET /api/reports/product-performance
 */
const getProductPerformanceReport = async (req, res, next) => {
    try {
        const { startDate, endDate, category_id, limit = 20 } = req.query;

        // Get top products
        const products = await Sale.getTopProducts({
            limit: parseInt(limit),
            startDate: startDate || null,
            endDate: endDate || null
        });

        // Calculate profit for each product
        const productsWithProfit = await Promise.all(
            products.map(async (p) => {
                const product = await Product.findById(p.id);
                const costPrice = product ? product.cost_price : 0;
                const profit = (p.total_revenue / p.total_quantity - costPrice) * p.total_quantity;
                const margin = p.total_revenue > 0 ? (profit / p.total_revenue) * 100 : 0;

                return {
                    ...p,
                    profit,
                    margin_percent: margin.toFixed(2)
                };
            })
        );

        const report = {
            period: {
                start: startDate || 'All time',
                end: endDate || 'Present'
            },
            products: productsWithProfit
        };

        return successResponse(res, report);
    } catch (error) {
        next(error);
    }
};

/**
 * Export report to CSV
 * @route GET /api/reports/export/csv
 */
const exportToCSV = async (req, res, next) => {
    try {
        const { type, date, year, month } = req.query;

        let data = [];
        let filename = 'report.csv';

        switch (type) {
            case 'daily':
                const dailyData = await Sale.getDailySummary(date || new Date().toISOString().slice(0, 10));
                data = [dailyData];
                filename = `daily-sales-${date}.csv`;
                break;
            case 'monthly':
                const monthlyData = await Sale.getMonthlySummary(
                    parseInt(year) || new Date().getFullYear(),
                    parseInt(month) || (new Date().getMonth() + 1)
                );
                data = [monthlyData];
                filename = `monthly-sales-${year}-${month}.csv`;
                break;
            case 'product':
                data = await Sale.getTopProducts({ limit: 50 });
                filename = 'product-performance.csv';
                break;
            default:
                data = [];
        }

        // Convert to CSV
        if (data.length === 0) {
            return res.status(400).json({ success: false, message: 'No data to export' });
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(h => {
                const val = row[h];
                return typeof val === 'string' ? `"${val}"` : val;
            });
            csvRows.push(values.join(','));
        }

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        logger.info(`CSV export: ${filename} by ${req.user.username}`);

        return res.send(csv);
    } catch (error) {
        next(error);
    }
};

/**
 * Export report to PDF
 * @route GET /api/reports/export/pdf
 */
const exportToPDF = async (req, res, next) => {
    try {
        const { type, date, year, month } = req.query;

        // For now, return JSON data (PDF generation would use PDFKit)
        let reportData = {};

        switch (type) {
            case 'daily':
                reportData = await Sale.getDailySummary(date || new Date().toISOString().slice(0, 10));
                break;
            case 'monthly':
                reportData = await Sale.getMonthlySummary(
                    parseInt(year) || new Date().getFullYear(),
                    parseInt(month) || (new Date().getMonth() + 1)
                );
                break;
            default:
                reportData = { message: 'Specify report type (daily, monthly)' };
        }

        logger.info(`PDF export requested: ${type} by ${req.user.username}`);

        return res.json({
            success: true,
            message: 'PDF export would be generated here',
            data: reportData
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions
async function getHourlyBreakdown(date) {
    const db = require('../config/database');
    const sql = `
    SELECT 
      HOUR(sale_date) as hour,
      COUNT(*) as transactions,
      SUM(total_amount) as sales
    FROM sales
    WHERE DATE(sale_date) = ? AND status = 'completed'
    GROUP BY HOUR(sale_date)
    ORDER BY hour
  `;
    return db.getMany(sql, [date]);
}

async function getDailyBreakdown(year, month) {
    const db = require('../config/database');
    const sql = `
    SELECT 
      DATE(sale_date) as date,
      COUNT(*) as transactions,
      SUM(total_amount) as sales
    FROM sales
    WHERE YEAR(sale_date) = ? AND MONTH(sale_date) = ? AND status = 'completed'
    GROUP BY DATE(sale_date)
    ORDER BY date
  `;
    return db.getMany(sql, [year, month]);
}

async function getWeeklyBreakdown(year, month) {
    const db = require('../config/database');
    const sql = `
    SELECT 
      WEEK(sale_date) - WEEK(DATE_FORMAT(sale_date, '%Y-%m-01')) + 1 as week,
      COUNT(*) as transactions,
      SUM(total_amount) as sales
    FROM sales
    WHERE YEAR(sale_date) = ? AND MONTH(sale_date) = ? AND status = 'completed'
    GROUP BY WEEK(sale_date)
    ORDER BY week
  `;
    return db.getMany(sql, [year, month]);
}

async function getCategoryBreakdown(year, month) {
    const db = require('../config/database');
    const sql = `
    SELECT 
      c.name as category_name,
      SUM(si.quantity) as items_sold,
      SUM(si.subtotal) as revenue
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE YEAR(s.sale_date) = ? AND MONTH(s.sale_date) = ? AND s.status = 'completed'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `;
    return db.getMany(sql, [year, month]);
}

module.exports = {
    getDailySalesReport,
    getMonthlySalesReport,
    getProductPerformanceReport,
    exportToCSV,
    exportToPDF
};
