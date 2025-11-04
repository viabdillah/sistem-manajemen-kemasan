// server/src/routes/managerRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/managerController');
const { 
  verifyFirebaseToken, 
  isManagerOrAdmin, 
  isManager // Middleware ketat
} = require('../middleware/authMiddleware');

// Rute untuk Halaman (Bisa diakses Manajer & Admin)
router.get('/dashboard-stats', verifyFirebaseToken, isManagerOrAdmin, controller.getDashboardStats);
router.get('/reports/production', verifyFirebaseToken, isManagerOrAdmin, controller.getProductionReport);
router.get('/charts/sales', verifyFirebaseToken, isManagerOrAdmin, controller.getSalesChartData);
router.get('/charts/material-usage', verifyFirebaseToken, isManagerOrAdmin, controller.getMaterialUsageChartData);

// Rute untuk Ekspor (HANYA BISA DIAKSES MANAJER)
router.get('/reports/financials/export', verifyFirebaseToken, isManager, controller.exportFinancials);
router.get('/reports/inventory/export', verifyFirebaseToken, isManager, controller.exportInventoryHistory);
router.get('/reports/orders/export', verifyFirebaseToken, isManager, controller.exportOrderHistory);

module.exports = router;