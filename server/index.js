const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const packagingTypeRoutes = require('./routes/packagingTypeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Sementara kita buka untuk semua agar gampang saat staging
    credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// --- Routes ---

// 1. Route Login (Masih kita simpan di sini biar simpel dulu)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Username tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password salah' });

    res.json({
      message: 'Login Berhasil',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        namaLengkap: user.namaLengkap
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error server', error: error.message });
  }
});

// 2. Gunakan Route User CRUD
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packaging-types', packagingTypeRoutes);
app.use('/api/transactions', transactionRoutes)

// --------------

// Tambahkan Route Default untuk Cek Server
app.get('/', (req, res) => {
  res.send('Server is running ready for Vercel');
});

// PENTING: Logic agar jalan di Vercel DAN Localhost
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}