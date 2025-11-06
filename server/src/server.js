// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const connectDB = require('./config/database');
const passport = require('passport'); // <-- 1. IMPOR PASSPORT

// --- Impor semua Rute Anda ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cashierRoutes = require('./routes/cashierRoutes');
const designerRoutes = require('./routes/designerRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const financialRoutes = require('./routes/financialRoutes');
const managerRoutes = require('./routes/managerRoutes');

// --- Hubungkan ke MongoDB Atlas ---
connectDB();

const app = express();
const PORT = process.env.PORT || 5001; 

// --- Pengaturan CORS (Sudah Benar) ---
const whitelist = [
  'http://localhost:5173', 
  'https://sistem-manajemen-kemasan.vercel.app',
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Domain ini tidak diizinkan oleh CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// --- Middleware ---

// 2. Body Parser (Sudah Benar)
app.use(express.json());

// 3. INISIALISASI PASSPORT (INI YANG HILANG)
app.use(passport.initialize());
require('./config/passportConfig')(passport); // Beri tahu passport tentang strategi JWT

// --- Rute API (Harus setelah middleware) ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kasir', cashierRoutes);
app.use('/api/desainer', designerRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/keuangan', financialRoutes);
app.use('/api/manager', managerRoutes);

// Rute tes sederhana
app.get('/api', (req, res) => {
  res.json({ message: 'Selamat datang di API Sistem Manajemen Kemasan (MongoDB)!' });
});

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});