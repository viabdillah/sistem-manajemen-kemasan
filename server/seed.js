// server/seed.js

const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const Role = require("./src/models/Role");
const User = require("./src/models/User"); // <-- Ini akan memuat model baru
const connectDB = require("./src/config/database");

// === KONFIGURASI PENTING ===
// 1. GANTI INI dengan EMAIL akun Anda
const ADMIN_EMAIL = "admin@kemasan.com"; // Ganti dengan email Anda

// 2. GANTI INI dengan PASSWORD BARU Anda
// Ini adalah password yang akan Anda gunakan untuk login
// 'bcryptjs' akan men-hash ini secara otomatis saat disimpan
const ADMIN_PASSWORD = "AdminSistemManajemenKemasan"; // Ganti dengan password yang kuat!

// 3. GANTI INI dengan Nama Lengkap akun Anda
const ADMIN_FULL_NAME = "Admin Sistem Utama";
// =============================

const rolesData = [
  { name: "admin_sistem" },
  { name: "kasir" },
  { name: "desainer" },
  { name: "operator" },
  { name: "manajer" },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("Koneksi database berhasil.");

    // 1. Hapus data yang sudah ada
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log("Data lama (Roles & Users) telah dihapus.");

    // 2. Isi data Roles
    const createdRoles = await Role.insertMany(rolesData);
    console.log("Roles berhasil diisi.");

    // Ambil ID dari peran 'admin_sistem'
    const adminRole = createdRoles.find((role) => role.name === "admin_sistem");
    if (!adminRole) {
      throw new Error("Gagal menemukan ID peran admin_sistem.");
    }

    // 3. Isi data User Admin Awal (dengan 'password')
    const adminUser = {
      // firebaseId dihapus
      full_name: ADMIN_FULL_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // <-- Password teks biasa
      role_id: adminRole._id,
      is_active: true,
    };

    // Saat User.create() dipanggil, hook 'pre-save' di User.js
    // akan OTOMATIS men-hash password sebelum menyimpannya.
    await User.create(adminUser);
    console.log(`Pengguna Admin Sistem (${ADMIN_EMAIL}) berhasil dibuat.`);

    console.log("✅ Proses Seeding Database Selesai! ✅");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal dalam proses Seeding Database:", error.message);
    process.exit(1);
  }
};

seedDB();
