// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport'); // <-- Impor Passport

// 1. Impor controller BARU
// Kita akan membuat fungsi-fungsi ini di langkah berikutnya
const { 
  login, 
  forgotPassword, 
  getCurrentUser 
} = require('../controllers/authController');

// 2. Impor dan inisialisasi konfigurasi Passport (Middleware BARU)
// Kita akan membuat file ini setelah controller
require('../config/passportConfig')(passport);

// --- Rute-rute Baru ---

// @route   POST /api/auth/login
// @desc    Login user dan return JWT (dipanggil oleh AuthContext/LoginPage)
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/forgot-password
// @desc    Menandai user untuk reset (dipanggil oleh LoginPage)
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   GET /api/auth/me
// @desc    Verifikasi token dan dapatkan data user (dipanggil oleh AuthContext saat load)
// @access  Private (Dilindungi oleh Passport JWT)
router.get(
  '/me', 
  passport.authenticate('jwt', { session: false }), // <-- Ini adalah middleware perlindungan BARU
  getCurrentUser
);

// HAPUS: Rute lama /api/auth/verify-role (sudah tidak relevan)

module.exports = router;