// server/src/middleware/authMiddleware.js
const passport = require('passport');

// --- HAPUS: SEMUA KODE FIREBASE ADMIN ---

// --- Middleware Autentikasi BARU ---
// Ini adalah "penjaga gerbang" utama kita.
// Ini adalah pengganti 'verifyFirebaseToken'
const protect = passport.authenticate('jwt', { session: false });

// --- Middleware Otorisasi (Pengecekan Role) ---
// Logika ini TIDAK PERLU DIUBAH.
// 'protect' akan mengisi 'req.user' dengan format yang sama
// (terima kasih kepada passportConfig.js), sehingga pengecekan ini
// akan berjalan sempurna.

const isAdminSystem = (req, res, next) => {
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
  protect, // <-- Ekspor 'protect' (pengganti verifyFirebaseToken)
  isAdminSystem, 
  isCashier,
  isFinanceAllowed,
  isDesigner,
  isOperator,
  isInventoryManager,
  isManagerOrAdmin,
  isManager
};