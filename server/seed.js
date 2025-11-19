const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

// Data User yang akan kita buat
const users = [
  {
    username: 'admin',
    password: 'admin123', // Password asli
    role: 'admin',
    namaLengkap: 'Administrator Sistem'
  },
  {
    username: 'kasir',
    password: 'kasir123',
    role: 'kasir',
    namaLengkap: 'Kasir Utama'
  },
  {
    username: 'operator',
    password: 'operator123',
    role: 'operator',
    namaLengkap: 'Operator Produksi'
  },
  {
    username: 'manajer',
    password: 'manajer123',
    role: 'manajer',
    namaLengkap: 'Bapak Manajer'
  }
];

const seedDatabase = async () => {
  try {
    // 1. Connect ke Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Terhubung ke MongoDB untuk Seeding...');

    // 2. Hapus semua user lama (agar tidak duplikat saat dijalankan ulang)
    await User.deleteMany();
    console.log('🧹 Data user lama dibersihkan.');

    // 3. Loop data users dan encrypt password
    for (let user of users) {
      // Hash password (mengacak password)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Buat user baru dengan password yang sudah di-hash
      await User.create({
        username: user.username,
        password: hashedPassword, // Simpan password terenkripsi
        role: user.role,
        namaLengkap: user.namaLengkap
      });
    }

    console.log('✅ Berhasil membuat 4 User Dummy!');
    process.exit(); // Keluar dari proses
  } catch (error) {
    console.error('❌ Gagal seeding:', error);
    process.exit(1);
  }
};

seedDatabase();