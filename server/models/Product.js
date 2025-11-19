const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productLabel: {
    type: String,
    required: true,
  },
  nib: {
    type: String,
    default: 'N/A',
  },
  noPirt: {
    type: String,
    default: 'N/A',
  },
  noHalal: {
    type: String,
    default: 'N/A',
  },
  // --- PERBAIKAN DI SINI ---
  packagingType: {
    type: String,
    required: true,
    // Hapus "enum" agar bisa menerima jenis kemasan dinamis apa saja
  },
  packagingSize: {
    type: String,
    required: true,
  },
  // -------------------------
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);