// server/src/controllers/authController.js

/**
 * [POST] Memverifikasi role user setelah login Firebase
 * Dipanggil SETELAH middleware 'verifyFirebaseToken'.
 * Versi Mongoose
 */
const verifyUserRole = (req, res) => {
    // req.user sudah diisi oleh middleware verifyFirebaseToken
    // Isinya: { id, firebase_uid, full_name, email, role_name, photoURL }

    if (!req.user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Kirim data user (terutama role_name) ke frontend
    res.status(200).json({
        message: 'Verifikasi user berhasil',
        user: req.user
    });
};

module.exports = {
  verifyUserRole,
  // Kita ganti 'handleLogin' menjadi 'verifyUserRole'
};