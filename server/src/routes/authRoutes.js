// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// 1. Impor controller (versi Mongoose)
const { verifyUserRole } = require('../controllers/authController');
// 2. Impor middleware (versi Mongoose)
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// 3. Pastikan rute ini ada dan menggunakan 'verifyUserRole'
// POST /api/auth/verify-role
router.post('/verify-role', verifyFirebaseToken, verifyUserRole);

module.exports = router;