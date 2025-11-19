const mongoose = require('mongoose');

// Membuat Schema (Struktur Data User)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Tidak boleh ada username kembar
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'kasir', 'operator', 'manajer'], // Hanya boleh 4 role ini
    default: 'operator',
    required: true
  },
  namaLengkap: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);