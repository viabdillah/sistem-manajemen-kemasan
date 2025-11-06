// server/src/controllers/adminController.js
// --- 1. HAPUS FIREBASE ADMIN ---
// const admin = require('firebase-admin');
const User = require("../models/User");
const Role = require("../models/Role");
const Order = require("../models/Order"); // Pastikan ini diimpor

/**
 * [GET] Mengambil daftar SEMUA pengguna
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("role_id")
      .sort({ created_at: -1 });

    // --- 2. PERBARUI FORMAT DATA (Hapus firebase_uid) ---
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id ? user.role_id._id : null,
      role_name: user.role_id ? user.role_id.name : null,
      created_at: user.created_at,
      is_active: user.is_active,
      passwordResetRequested: user.passwordResetRequested,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users (Mongoose):", error);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

/**
 * [GET] Mengambil daftar SEMUA role yang bisa di-assign.
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const getAssignableRoles = async (req, res) => {
  try {
    const roles = await Role.find({ name: { $ne: "admin_sistem" } });
    const formattedRoles = roles.map((role) => ({
      id: role._id,
      name: role.name,
    }));
    res.status(200).json(formattedRoles);
  } catch (error) {
    console.error("Error fetching roles (Mongoose):", error);
    res.status(500).json({ message: "Gagal mengambil data role" });
  }
};

/**
 * [PUT] Mengedit data pengguna (Nama, Role)
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const editUser = async (req, res) => {
  const { userId } = req.params;
  const { full_name, role_id } = req.body;

  if (!full_name || !role_id) {
    return res
      .status(400)
      .json({ message: "Nama lengkap dan Role ID wajib diisi" });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { full_name: full_name, role_id: role_id },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json({ message: "Data pengguna berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui data pengguna" });
  }
};

/**
 * [DELETE] Menonaktifkan pengguna (Soft Delete)
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { is_active: false },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json({ message: "Pengguna berhasil dinonaktifkan" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menonaktifkan pengguna" });
  }
};

// --- 3. TAMBAHAN FUNGSI BARU ---
/**
 * [POST] /api/admin/users/create
 * Membuat pengguna baru (oleh Admin)
 * Dipanggil oleh AddUserModal
 */
const createNewUser = async (req, res) => {
  const { full_name, email, password, role_id } = req.body;

  // 1. Validasi input
  if (!full_name || !email || !password || !role_id) {
    return res
      .status(400)
      .json({
        message: "Semua field (Nama, Email, Password, Role) wajib diisi",
      });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password harus minimal 6 karakter" });
  }

  try {
    // 2. Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email ini sudah terdaftar' });
    }

    // 3. Buat user baru
    // Model User.js akan otomatis men-hash password berkat 'pre-save' hook
    const newUser = new User({
      full_name,
      email: email.toLowerCase(),
      password, // Kirim teks biasa, Mongoose akan men-hash
      role_id,
      is_active: true, // Asumsi user baru langsung aktif
    });

    // 4. Simpan ke database
    await newUser.save();

    res
      .status(201)
      .json({ message: `Pengguna ${full_name} berhasil didaftarkan` });
  } catch (error) {
    // Tangani error duplikasi jika ada (meskipun kita sudah cek)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email ini sudah terdaftar." });
    }
    console.error("Error saat membuat user baru:", error);
    res.status(500).json({ message: "Server Error saat membuat pengguna" });
  }
};
// --- AKHIR TAMBAHAN FUNGSI BARU ---

/**
 * [POST] Mereset password pengguna (dilakukan oleh Admin)
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const sendPasswordReset = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID dan Password baru diperlukan" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password baru harus minimal 6 karakter" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    user.password = newPassword;
    user.passwordResetRequested = false;
    user.passwordResetRequestedAt = null;
    await user.save();
    res
      .status(200)
      .json({ message: `Password untuk ${user.full_name} berhasil direset` });
  } catch (error) {
    console.error("Error saat admin reset password:", error);
    res.status(500).json({ message: "Gagal mereset password" });
  }
};

/**
 * [GET] Mengambil statistik utama untuk Dashboard Admin
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    const total_users = await User.countDocuments();
    const users_awaiting_role = await User.countDocuments({ role_id: null });
    const total_orders = await Order.countDocuments();

    const newUsersRaw = await User.find({ role_id: null })
      .sort({ created_at: -1 })
      .limit(5);

    const newUsers = newUsersRaw.map((user) => ({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at,
    }));

    res.status(200).json({
      stats: {
        total_users,
        users_awaiting_role,
        total_orders,
      },
      newUsers: newUsers,
    });
  } catch (error) {
    console.error("Error fetching admin stats (Mongoose):", error);
    res.status(500).json({ message: "Gagal mengambil statistik admin" });
  }
};

/**
 * [PUT] Membatalkan pesanan
 * (Tidak ada perubahan, fungsi ini sudah benar)
 */
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    if (order.order_status === "cancelled") {
      return res.status(400).json({ message: "Pesanan ini sudah dibatalkan" });
    }
    order.order_status = "cancelled";
    await order.save();
    res.status(200).json({ message: "Pesanan berhasil dibatalkan" });
  } catch (error) {
    console.error("Error cancelling order (Mongoose):", error);
    res.status(500).json({ message: "Gagal membatalkan pesanan" });
  }
};

// --- 4. PERBARUI module.exports ---
module.exports = {
  getAllUsers,
  getAssignableRoles,
  editUser,
  deleteUser,
  createNewUser, // <-- Tambahkan fungsi baru
  sendPasswordReset,
  getAdminDashboardStats,
  cancelOrder,
};
