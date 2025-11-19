const mongoose = require('mongoose');

const packagingTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  // ARRAY BARU: Menyimpan varian ukuran dan harga
  sizes: [{
    size: { type: String, required: true },
    price: { type: Number, required: true, default: 0 }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PackagingType', packagingTypeSchema);