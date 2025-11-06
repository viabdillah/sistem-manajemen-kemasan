// server/src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/managerController');

// --- 1. IMPOR MIDDLEWARE BARU ---
const { 
  protect, // <-- Ganti 'verifyFirebaseToken'
  isManagerOrAdmin, 
  isManager // Middleware ketat
} = require('../middleware/authMiddleware');

// --- 2. PERBARUI SETIAP RUTE DENGAN 'protect' ---

// Rute untuk Halaman (Bisa diakses Manajer & Admin)
router.get('/dashboard-stats', protect, isManagerOrAdmin, controller.getDashboardStats);
router.get('/reports/production', protect, isManagerOrAdmin, controller.getProductionReport);
router.get('/charts/sales', protect, isManagerOrAdmin, controller.getSalesChartData);
router.get('/charts/material-usage', protect, isManagerOrAdmin, controller.getMaterialUsageChartData);

// Rute untuk Ekspor (HANYA BISA DIAKSES MANAJER)
router.get('/reports/financials/export', protect, isManager, controller.exportFinancials);
router.get('/reports/inventory/export', protect, isManager, controller.exportInventoryHistory);
router.get('/reports/orders/export', protect, isManager, controller.exportOrderHistory);

module.exports = router;