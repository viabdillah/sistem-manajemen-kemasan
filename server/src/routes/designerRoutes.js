// server/src/routes/designerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDesignQueue,
  getDesignHistory,
  sendToProduction,
} = require('../controllers/designerController');

// --- 1. IMPOR MIDDLEWARE BARU ---
const { 
  protect, // <-- Ganti 'verifyFirebaseToken'
  isDesigner 
} = require('../middleware/authMiddleware');

// --- 2. PASANG MIDDLEWARE BARU ---
// Lindungi semua rute Desainer
// Pertama, cek token JWT (protect), lalu pastikan perannya adalah Desainer (isDesigner)
router.use(protect, isDesigner);

// --- Rute-rute ini sekarang aman dengan JWT ---

// GET /api/desainer/queue (Antrian pekerjaan baru)
router.get('/queue', getDesignQueue);

// GET /api/desainer/history (Riwayat pekerjaan)
router.get('/history', getDesignHistory);

// PUT /api/desainer/send-to-production/:orderId (Tombol aksi)
router.put('/send-to-production/:orderId', sendToProduction);

module.exports = router;