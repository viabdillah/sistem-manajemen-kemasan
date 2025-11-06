// server/src/routes/financialRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllTransactions, 
  createManualTransaction,
  getSalesChartData
} = require('../controllers/financialController');

// --- 1. IMPOR MIDDLEWARE BARU ---
const { 
  protect, // <-- Ganti 'verifyFirebaseToken'
  isFinanceAllowed 
} = require('../middleware/authMiddleware');

// --- 2. PASANG MIDDLEWARE BARU ---
// Lindungi semua rute keuangan
// Pertama, cek token JWT (protect), lalu pastikan perannya sesuai (isFinanceAllowed)
router.use(protect, isFinanceAllowed);

// --- Rute-rute ini sekarang aman dengan JWT ---

// GET /api/keuangan/transactions
router.get('/transactions', getAllTransactions);

// POST /api/keuangan/transactions
router.post('/transactions', createManualTransaction);

// GET /api/keuangan/charts/sales
router.get('/charts/sales', getSalesChartData);

module.exports = router;