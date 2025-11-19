const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true }, // Cth: INV-20251119-0001
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  
  // Daftar Produk yang dibeli (Snapshot data saat transaksi terjadi)
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    packagingType: String,
    packagingSize: String,
    pricePerUnit: Number, // Harga saat transaksi (agar tidak berubah jika master harga berubah)
    qty: Number,
    subtotal: Number,
    hasDesign: { type: Boolean, default: true }, // true = Sudah Ada, false = Belum Ada
    note: { type: String, default: '' }
  }],

  // Keuangan
  totalAmount: { type: Number, required: true }, // Total Tagihan
  totalPaid: { type: Number, default: 0 },       // Total yang sudah dibayar
  remainingBalance: { type: Number, required: true }, // Sisa Tagihan

  // Riwayat Pembayaran (Array untuk menampung DP, Pelunasan, Cicilan)
  payments: [{
    date: { type: Date, default: Date.now },
    amount: Number,
    method: { type: String, enum: ['Cash', 'Transfer'] },
    note: String, // Cth: "DP Awal", "Pelunasan"
    evidence: String // Opsional: URL foto bukti transfer
  }],

  status: {
    type: String,
    enum: ['Pending', 'Down Payment', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  
  // Status Pengerjaan (Opsional untuk Operator)
  orderStatus: {
    type: String,
    enum: ['Queue', 'Designing', 'Production', 'Ready', 'Completed', 'Rejected'], 
    default: 'Queue'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);