// server/src/routes/cashierRoutes.js
const express = require('express');
const router = express.Router();

// 1. Impor fungsi (getProductsList sudah dihapus)
const { 
  createCustomer,
  getCustomersList,
  createNewOrder,
  getOrderHistory,
  processPayment,
  getOrderDetailsForInvoice,
  getCashierDashboardStats
} = require('../controllers/cashierController');

const { verifyFirebaseToken, isCashier, isFinanceAllowed } = require('../middleware/authMiddleware');

// Pasang middleware keamanan untuk SEMUA rute kasir
router.use(verifyFirebaseToken, isCashier);
router.post('/orders', verifyFirebaseToken, isCashier, createNewOrder);

// Middleware keamanan: isFinanceAllowed (bisa dilihat Admin, Kasir, Manajer)
router.get('/customers', verifyFirebaseToken, isFinanceAllowed, getCustomersList);
router.get('/orders', verifyFirebaseToken, isFinanceAllowed, getOrderHistory);

// --- Rute-rute Kasir ---
router.get('/dashboard-stats', verifyFirebaseToken, isCashier, getCashierDashboardStats);

// POST /api/kasir/customers (Membuat pelanggan baru)
router.post('/customers', createCustomer);

// GET /api/kasir/customers (Mengambil daftar pelanggan)
router.get('/customers', getCustomersList);

// POST /api/kasir/orders (Membuat pesanan baru)
router.post('/orders', createNewOrder);

// GET /api/kasir/orders (Mengambil riwayat pesanan)
router.get('/orders', getOrderHistory);

// PUT /api/kasir/pay/:orderId (Tombol "Bayar")
router.put('/pay/:orderId', verifyFirebaseToken, isFinanceAllowed, processPayment);

// GET /api/kasir/orders/:orderId/details (Untuk melihat 1 invoice)
router.get('/orders/:orderId/details', verifyFirebaseToken, isFinanceAllowed, getOrderDetailsForInvoice);

module.exports = router;