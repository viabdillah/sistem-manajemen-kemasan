// server/src/config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI tidak ditemukan di file .env');
    }

    await mongoose.connect(mongoURI);
    
    console.log('MongoDB (Atlas) terhubung...');
  } catch (err) {
    console.error(err.message);
    // Keluar dari proses jika gagal terhubung
    process.exit(1);
  }
};

module.exports = connectDB;