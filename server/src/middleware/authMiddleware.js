// server/src/middleware/authMiddleware.js
const admin = require('firebase-admin');
const User = require('../models/User'); // <-- Impor model User (Mongoose)
const Role = require('../models/Role'); // <-- Impor model Role (Mongoose)

// Inisialisasi Firebase Admin
if (admin.apps.length === 0) {
  try {
    const serviceAccount = require('../config/firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error("Gagal inisialisasi Firebase Admin:", error.message);
    // Ini adalah error fatal, server tidak boleh lanjut jika config Firebase salah
    process.exit(1); 
  }
}

/**
 * Middleware untuk memverifikasi ID Token Firebase
 * Versi Mongoose / MongoDB
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak valid atau tidak ada' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verifikasi token, dapatkan data dari Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Cari user di DB kita menggunakan UID
    // Kita 'populate' role_id untuk langsung mendapatkan data 'role'
    let user = await User.findOne({ firebase_uid: uid }).populate('role_id');

    if (user) {
      // --- SKENARIO 1: Pengguna Ditemukan (Login Normal) ---
      
      // Cek apakah akun nonaktif (Soft Delete)
      if (!user.is_active) {
        return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan.' });
      }
      
      // Ubah dokumen Mongoose menjadi objek biasa
      req.user = user.toObject(); 
      req.user.role_name = user.role_id ? user.role_id.name : null; // Tambahkan role_name
      req.user.photoURL = picture;
      return next();
    }

    // --- SKENARIO 2: Pengguna TIDAK Ditemukan oleh UID ---
    
    // 3. Coba cari pengguna berdasarkan EMAIL
    user = await User.findOne({ email: email }).populate('role_id');

    if (user) {
      // --- SKENARIO 3: Ditemukan via Email (Akun Perlu Ditautkan) ---
      
      // Cek apakah akun nonaktif
      if (!user.is_active) {
        return res.status(403).json({ message: 'Akun Anda telah dinonaktifkan.' });
      }
      
      // Update UID di DB agar sesuai dengan UID login terakhir
      user.firebase_uid = uid;
      await user.save();
      
      req.user = user.toObject();
      req.user.role_name = user.role_id ? user.role_id.name : null;
      req.user.photoURL = picture;
      return next();
    }

    // --- SKENARIO 4: Pengguna Benar-Benar Baru ---
    try {
      // Buat pengguna baru di database
      const newUser = await User.create({
        firebase_uid: uid,
        full_name: name,
        email: email,
        role_id: null, // role_id akan null (belum di-assign)
        is_active: true
      });
      
      req.user = newUser.toObject();
      req.user.role_name = null; // Belum ada role
      req.user.photoURL = picture;
      return next();
    } catch (insertError) {
      console.error('Gagal auto-register user (Mongoose):', insertError);
      return res.status(500).json({ message: 'Gagal mendaftarkan user baru' });
    }

  } catch (error) {
    console.error('Error verifikasi token (Mongoose):', error);
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};


// --- Middleware Keamanan Role (Menggunakan data dari req.user) ---

const isAdminSystem = (req, res, next) => {
    // req.user sudah di-attach oleh verifyFirebaseToken
    if (req.user && req.user.role_name === 'admin_sistem') {
        next();
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Admin Sistem.' });
    }
};

const isCashier = (req, res, next) => {
    if (req.user && (req.user.role_name === 'kasir' || req.user.role_name === 'admin_sistem')) {
        next();
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Kasir atau Admin.' });
    }
};

const isFinanceAllowed = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'admin_sistem' || role === 'kasir' || role === 'manajer') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Admin, Kasir, atau Manajer.' });
  }
};

const isDesigner = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'desainer' || role === 'admin_sistem') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Desainer atau Admin.' });
  }
};

const isOperator = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'operator' || role === 'admin_sistem') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Operator atau Admin.' });
  }
};

const isInventoryManager = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'admin_sistem' || role === 'operator' || role === 'manajer') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin mengelola inventaris.' });
  }
};

const isManagerOrAdmin = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'manajer' || role === 'admin_sistem') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Manajer atau Admin.' });
  }
};

const isManager = (req, res, next) => {
  const role = req.user?.role_name;
  if (role === 'manajer') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Fitur ini hanya untuk Manajer.' });
  }
};

// --- Ekspor semua middleware ---
module.exports = { 
  verifyFirebaseToken, 
  isAdminSystem, 
  isCashier,
  isFinanceAllowed,
  isDesigner,
  isOperator,
  isInventoryManager,
  isManagerOrAdmin,
  isManager
};