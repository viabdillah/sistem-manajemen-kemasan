// server/src/controllers/adminController.js
const admin = require('firebase-admin'); // Diperlukan untuk reset password
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * [GET] Mengambil daftar SEMUA pengguna (yang aktif)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ is_active: true })
      .populate('role_id') // Ganti ID role dengan data role-nya
      .sort({ created_at: -1 }); // Urutkan terbaru dulu

    // Ubah data untuk frontend
    const formattedUsers = users.map(user => ({
      id: user._id, // MongoDB menggunakan _id
      firebase_uid: user.firebase_uid,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id ? user.role_id._id : null,
      role_name: user.role_id ? user.role_id.name : null,
      created_at: user.created_at
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data pengguna' });
  }
};

/**
 * [GET] Mengambil daftar SEMUA role yang bisa di-assign.
 */
const getAssignableRoles = async (req, res) => {
  try {
    // Cari semua role KECUALI 'admin_sistem'
    const roles = await Role.find({ name: { $ne: 'admin_sistem' } });
    
    // Ubah data untuk frontend (ganti _id menjadi id)
    const formattedRoles = roles.map(role => ({
      id: role._id,
      name: role.name
    }));
    
    res.status(200).json(formattedRoles);
  } catch (error) {
    console.error('Error fetching roles (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil data role' });
  }
};

/**
 * [PUT] Mengedit data pengguna (Nama, Role)
 */
const editUser = async (req, res) => {
  const { userId } = req.params; // Ini adalah _id MongoDB
  const { full_name, role_id } = req.body;

  if (!full_name || !role_id) {
    return res.status(400).json({ message: 'Nama lengkap dan Role ID wajib diisi' });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        full_name: full_name,
        role_id: role_id
      },
      { new: true } // Mengembalikan dokumen yang sudah di-update
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(200).json({ message: 'Data pengguna berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui data pengguna' });
  }
};

/**
 * [DELETE] Menonaktifkan pengguna (Soft Delete)
 */
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Kita tidak menghapus, kita update 'is_active' menjadi false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { is_active: false },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(200).json({ message: 'Pengguna berhasil dinonaktifkan' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan pengguna' });
  }
};

/**
 * [POST] Memicu email reset password dari Firebase
 */
const sendPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email diperlukan' });
  }
  try {
    // Gunakan Firebase Admin SDK (tidak berubah)
    await admin.auth().generatePasswordResetLink(email);
    res.status(200).json({ message: 'Email reset password telah dikirim' });
  } catch (error) {
    console.error('Error sending password reset:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'Email tidak terdaftar di Firebase' });
    }
    res.status(500).json({ message: 'Gagal mengirim email reset' });
  }
};

/**
 * [GET] Mengambil statistik utama untuk Dashboard Admin
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Ambil Statistik Angka
    const total_users = await User.countDocuments();
    const users_awaiting_role = await User.countDocuments({ role_id: null });
    // Kita belum punya model Order, jadi kita skip total_orders
    // const total_orders = await Order.countDocuments(); 

    // 2. Ambil Daftar Pengguna Baru (5 terbaru)
    const newUsersRaw = await User.find({ role_id: null })
      .sort({ created_at: -1 })
      .limit(5);

    // Format data untuk frontend
    const newUsers = newUsersRaw.map(user => ({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at
    }));

    res.status(200).json({
      stats: {
        total_users,
        users_awaiting_role,
        total_orders: 0 // Placeholder
      },
      newUsers: newUsers
    });

  } catch (error) {
    console.error('Error fetching admin stats (Mongoose):', error);
    res.status(500).json({ message: 'Gagal mengambil statistik admin' });
  }
};

/**
 * [PUT] Membatalkan pesanan
 * Versi Mongoose
 */
const Order = require('../models/Order'); // Pastikan Order di-impor di atas
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    if (order.order_status === 'cancelled') {
      return res.status(400).json({ message: 'Pesanan ini sudah dibatalkan' });
    }

    order.order_status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Pesanan berhasil dibatalkan' });
  } catch (error) {
    console.error('Error cancelling order (Mongoose):', error);
    res.status(500).json({ message: 'Gagal membatalkan pesanan' });
  }
};

// --- PERBARUI module.exports ---
module.exports = {
  getAllUsers,
  getAssignableRoles,
  editUser,
  deleteUser,
  sendPasswordReset,
  getAdminDashboardStats,
  cancelOrder, // <-- Tambahkan ini
};