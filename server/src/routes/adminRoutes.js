// server/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAssignableRoles,
  updateUserRole,
  cancelOrder,
  getAdminDashboardStats,
  editUser,
  deleteUser,
  sendPasswordReset
} = require('../controllers/adminController');

const {
  verifyFirebaseToken,
  isAdminSystem,
} = require('../middleware/authMiddleware');

// --- Rute yang Dilindungi ---
// Semua rute di file ini akan:
// 1. Memverifikasi token Firebase (verifyFirebaseToken)
// 2. Memastikan user adalah 'admin_sistem' (isAdminSystem)

// Pasang middleware untuk SEMUA rute di bawah ini
router.use(verifyFirebaseToken, isAdminSystem);

router.get('/dashboard-stats', getAdminDashboardStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// GET /api/admin/roles
router.get('/roles', getAssignableRoles);

// PUT /api/admin/users/:userId/role
// :userId adalah ID dari database (misal: 5), BUKAN UID firebase
router.put('/users/:userId/edit', editUser);

router.delete('/users/:userId', deleteUser);
router.post('/users/reset-password', sendPasswordReset);

router.put('/orders/:orderId/cancel', cancelOrder);

module.exports = router;