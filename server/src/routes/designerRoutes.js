// server/src/routes/designerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDesignQueue,
  getDesignHistory,
  sendToProduction,
} = require('../controllers/designerController');
const { 
  verifyFirebaseToken, 
  isDesigner 
} = require('../middleware/authMiddleware');

// Lindungi semua rute Desainer
router.use(verifyFirebaseToken, isDesigner);

// GET /api/desainer/queue (Antrian pekerjaan baru)
router.get('/queue', getDesignQueue);

// GET /api/desainer/history (Riwayat pekerjaan)
router.get('/history', getDesignHistory);

// PUT /api/desainer/submit-review/:orderId (Tombol aksi)
router.put('/send-to-production/:orderId', sendToProduction);

module.exports = router;