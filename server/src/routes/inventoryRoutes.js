// server/src/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');

// --- 1. IMPOR MIDDLEWARE BARU ---
const { 
  protect, // <-- Ganti 'verifyFirebaseToken'
  isInventoryManager 
} = require('../middleware/authMiddleware');

// --- 2. PASANG MIDDLEWARE BARU ---
// Lindungi semua rute
// Pertama, cek token JWT (protect), lalu pastikan perannya sesuai (isInventoryManager)
router.use(protect, isInventoryManager);

// --- Rute-rute ini sekarang aman dengan JWT ---

// GET /api/inventory/materials (Melihat Stok)
router.get('/materials', controller.getAllMaterials);

// POST /api/inventory/materials (Menambah bahan baru)
router.post('/materials', controller.createNewMaterial);

// GET /api/inventory/history (Melihat riwayat)
router.get('/history', controller.getMaterialHistory);

// POST /api/inventory/stock-in (Mencatat pemasukan)
router.post('/stock-in', controller.addMaterialStock);

module.exports = router;