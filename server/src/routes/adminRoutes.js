// server/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAssignableRoles,
  cancelOrder,
  getAdminDashboardStats,
  editUser,
  deleteUser,
  sendPasswordReset,
  createNewUser // <-- 1. Impor controller baru
} = require('../controllers/adminController');

const {
  protect, 
  isAdminSystem,
} = require('../middleware/authMiddleware');

// Pasang middleware untuk SEMUA rute di bawah ini
router.use(protect, isAdminSystem);

// --- Rute-rute yang ada ---

router.get('/dashboard-stats', getAdminDashboardStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// GET /api/admin/roles
router.get('/roles', getAssignableRoles);

// PUT /api/admin/users/:userId/edit
router.put('/users/:userId/edit', editUser);

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', deleteUser);

// POST /api/admin/users/reset-password
router.post('/users/reset-password', sendPasswordReset);

// --- 2. Tambahkan Rute Baru di Sini ---
// POST /api/admin/users/create (Endpoint untuk AddUserModal)
router.post('/users/create', createNewUser);

// PUT /api/admin/orders/:orderId/cancel
router.put('/orders/:orderId/cancel', cancelOrder);

module.exports = router;