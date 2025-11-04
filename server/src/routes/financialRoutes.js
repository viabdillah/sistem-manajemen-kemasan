// server/src/routes/financialRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllTransactions, 
  createManualTransaction,
  getSalesChartData
} = require('../controllers/financialController');
const { 
  verifyFirebaseToken, 
  isFinanceAllowed 
} = require('../middleware/authMiddleware');

// Lindungi semua rute keuangan
router.use(verifyFirebaseToken, isFinanceAllowed);

// GET /api/keuangan/transactions
router.get('/transactions', getAllTransactions);

// POST /api/keuangan/transactions
router.post('/transactions', createManualTransaction);

// GET /api/keuangan/charts/sales
router.get('/charts/sales', getSalesChartData);

module.exports = router;