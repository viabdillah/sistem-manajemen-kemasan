// server/src/routes/operatorRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/operatorController');
const { 
  verifyFirebaseToken, 
  isOperator 
} = require('../middleware/authMiddleware');

// Lindungi semua rute
router.use(verifyFirebaseToken, isOperator);

// GET /api/operator/queue (Antrian baru)
router.get('/queue', controller.getProductionQueue);

// GET /api/operator/in-progress (Yang sedang dikerjakan)
router.get('/in-progress', controller.getInProgressOrders);

// PUT /api/operator/start/:orderId (Mulai produksi & kurangi stok)
router.put('/start/:orderId', controller.startProduction);

// PUT /api/operator/finish/:orderId (Selesai produksi)
router.put('/finish/:orderId', controller.finishProduction);

module.exports = router;