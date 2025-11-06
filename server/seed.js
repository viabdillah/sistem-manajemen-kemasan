// server/seed.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Pastikan memuat .env
const Role = require('./src/models/Role'); 
const User = require('./src/models/User'); 
const connectDB = require('./src/config/database'); 

// === KONFIGURASI PENTING ===
// 1. GANTI INI dengan FIREBASE UID akun Anda yang ingin dijadikan ADMIN
// Anda bisa mendapatkan UID dari konsol Firebase -> Authentication -> Users
const ADMIN_FIREBASE_UID = 'bntIylerPMV1SxxrxsvYZiY22m83'; 

// 2. GANTI INI dengan EMAIL akun Anda
const ADMIN_EMAIL = 'diviabdillah94@gmail.com'; 

// 3. GANTI INI dengan Nama Lengkap akun Anda
const ADMIN_FULL_NAME = 'Admin Sistem Utama'; 
// =============================


const rolesData = [
    { name: 'admin_sistem' },
    { name: 'kasir' },
    { name: 'desainer' },
    { name: 'operator' },
    { name: 'manajer' }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Koneksi database berhasil.');

        // 1. Hapus data yang sudah ada (untuk mencegah duplikasi saat testing)
        await Role.deleteMany({});
        await User.deleteMany({});
        console.log('Data lama (Roles & Users) telah dihapus.');

        // 2. Isi data Roles
        const createdRoles = await Role.insertMany(rolesData);
        console.log('Roles berhasil diisi.');

        // Ambil ID dari peran 'admin_sistem'
        const adminRole = createdRoles.find(role => role.name === 'admin_sistem');
        if (!adminRole) {
            throw new Error('Gagal menemukan ID peran admin_sistem.');
        }

        // 3. Isi data User Admin Awal
        const adminUser = {
            firebase_uid: ADMIN_FIREBASE_UID,
            full_name: ADMIN_FULL_NAME,
            email: ADMIN_EMAIL,
            role_id: adminRole._id, // Assign ID peran Admin
            is_active: true
        };

        await User.create(adminUser);
        console.log(`Pengguna Admin Sistem (${ADMIN_EMAIL}) berhasil dibuat.`);

        console.log('✅ Proses Seeding Database Selesai! ✅');
        process.exit(0);

    } catch (error) {
        console.error('❌ Gagal dalam proses Seeding Database:', error.message);
        process.exit(1);
    }
};

seedDB();