// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const connectDB = require('./config/database'); // <-- Impor koneksi baru

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

// Middleware
// Middleware

// --- Pengaturan CORS yang Lebih Aman ---
// Ganti 'https://url-frontend-vercel-anda.vercel.app' dengan URL Vercel Anda nanti
const whitelist = [
  'http://localhost:5173', // Ganti 5173 jika port frontend lokal Anda berbeda
  'https://sistem-manajemen-kemasan.vercel.app/',
  'https://backend-kemasan-production.up.railway.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan jika origin ada di whitelist ATAU jika request tidak punya origin (misal: Postman)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Domain ini tidak diizinkan oleh CORS'));
    }
  },
  credentials: true // Izinkan pengiriman cookies/token
};

app.use(cors(corsOptions));
// --- Selesai Pengaturan CORS ---

app.use(express.json());

// Rute API
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