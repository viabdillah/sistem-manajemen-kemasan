const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  type: { type: String, enum: ['pemasukan', 'pengeluaran'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', sparse: true },
  recorded_by_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);