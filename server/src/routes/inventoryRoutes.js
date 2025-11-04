// server/src/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');
const { 
  verifyFirebaseToken, 
  isInventoryManager 
} = require('../middleware/authMiddleware');

// Lindungi semua rute
router.use(verifyFirebaseToken, isInventoryManager);

// GET /api/inventory/materials (Melihat Stok)
router.get('/materials', controller.getAllMaterials);

// POST /api/inventory/materials (Menambah bahan baru)
router.post('/materials', controller.createNewMaterial);

// GET /api/inventory/history (Melihat riwayat)
router.get('/history', controller.getMaterialHistory);

// POST /api/inventory/stock-in (Mencatat pemasukan)
router.post('/stock-in', controller.addMaterialStock);

module.exports = router;