const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaterialHistorySchema = new Schema({
  material_id: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
  type: { type: String, enum: ['pemasukan', 'pengeluaran'], required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', sparse: true },
  recorded_by_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaterialHistory', MaterialHistorySchema);