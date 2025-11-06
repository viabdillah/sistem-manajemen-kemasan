// server/src/controllers/authController.js
const User = require('../models/User'); // <-- Impor model User baru kita
const Role = require('../models/Role'); // <-- Kita perlu ini untuk populate
const jwt = require('jsonwebtoken'); // <-- Impor jsonwebtoken untuk membuat token
require('dotenv').config(); // <-- Pastikan variabel env dimuat

// Pastikan Anda memiliki variabel ini di file 'server/.env' Anda!
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET tidak didefinisikan di .env");
  process.exit(1);
}

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan return JWT (dipanggil oleh AuthContext/LoginPage)
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validasi input sederhana
  if (!email || !password) {
    return res.status(400).json({ message: 'Mohon masukkan email dan password' });
  }

  try {
    // 2. Cari user di database berdasarkan email
    // Kita populate role_id untuk mendapatkan nama peran
    const user = await User.findOne({ email }).populate('role_id');

    // 3. Cek jika user tidak ada
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // 4. Cek jika user dinonaktifkan
    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan' });
    }

    // 5. Bandingkan password (menggunakan method comparePassword dari User.js)
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // 6. --- SUKSES! --- Buat Payload untuk Token
    // Payload ini adalah data yang akan disimpan di dalam JWT
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role_name: user.role_id ? user.role_id.name : null
      }
    };

    // 7. Buat (Sign) Token
    const token = jwt.sign(
      payload, 
      JWT_SECRET, 
      { expiresIn: '1d' } // Token berlaku selama 1 hari
    );

    // 8. Kirim token dan data user kembali ke client
    res.status(200).json({
      message: 'Login berhasil',
      token: token, // Client akan menyimpan ini di localStorage
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role_name: user.role_id ? user.role_id.name : null,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error("Server error saat login:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Menandai user untuk reset (alur kustom Anda)
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Mohon masukkan email' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Kirim respons sukses palsu untuk keamanan
      // agar orang tidak bisa menebak email yang terdaftar
      return res.status(200).json({ message: 'Permintaan reset terkirim. Mohon hubungi Admin Sistem untuk verifikasi.' });
    }

    // --- ALUR KUSTOM ANDA ---
    // Set flag di database sesuai model User.js
    user.passwordResetRequested = true;
    user.passwordResetRequestedAt = Date.now();
    await user.save();

    // Kirim respons yang diminta oleh LoginPage.jsx
    res.status(200).json({ message: 'Permintaan reset terkirim. Mohon hubungi Admin Sistem untuk verifikasi.' });

  } catch (error) {
    console.error("Server error saat forgot password:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Mengambil data user yang sedang login (via token)
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  // Catatan: Middleware 'passport.authenticate' akan berjalan SEBELUM fungsi ini.
  // Jika token valid, Passport akan mengambil payload, mencari user di DB,
  // dan menaruhnya di 'req.user'.

  // Kita hanya perlu mengirimkan kembali data user yang sudah disiapkan oleh Passport
  // (Kita akan konfigurasikan ini di passportConfig.js)
  
  if (!req.user) {
    return res.status(404).json({ message: "User tidak ditemukan dari token" });
  }
  
  res.status(200).json({ user: req.user });
};


// Ekspor fungsi-fungsi baru
module.exports = {
  login,
  forgotPassword,
  getCurrentUser
};