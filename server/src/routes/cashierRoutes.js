// server/src/routes/cashierRoutes.js
const express = require('express');
const router = express.Router();

// 1. Impor controller (tidak berubah)
const { 
  createCustomer,
  getCustomersList,
  createNewOrder,
  getOrderHistory,
  processPayment,
  getOrderDetailsForInvoice,
  getCashierDashboardStats
} = require('../controllers/cashierController');

// 2. Impor middleware BARU
const { 
  protect, // <-- Ganti 'verifyFirebaseToken'
  isCashier, 
  isFinanceAllowed 
} = require('../middleware/authMiddleware');

// --- 3. PASANG MIDDLEWARE PERLINDUNGAN JWT (Global) ---
// Semua rute di file ini sekarang WAJIB memiliki token JWT yang valid.
router.use(protect);

// --- 4. Terapkan Middleware Peran (Spesifik per Rute) ---

// Rute-rute ini HANYA untuk KASIR (dan Admin)
router.get('/dashboard-stats', isCashier, getCashierDashboardStats);
router.post('/customers', isCashier, createCustomer); // Membuat pelanggan baru
router.post('/orders', isCashier, createNewOrder); // Membuat pesanan baru

// Rute-rute ini untuk KEUANGAN (Admin, Kasir, Manajer)
router.get('/customers', isFinanceAllowed, getCustomersList); // Melihat daftar pelanggan
router.get('/orders', isFinanceAllowed, getOrderHistory); // Melihat riwayat pesanan
router.put('/pay/:orderId', isFinanceAllowed, processPayment); // Memproses pembayaran
router.get('/orders/:orderId/details', isFinanceAllowed, getOrderDetailsForInvoice); // Melihat invoice

module.exports = router;