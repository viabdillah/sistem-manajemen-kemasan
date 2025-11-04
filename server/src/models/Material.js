const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String },
  quantity: { type: Number, default: 0 },
  unit: { type: String, required: true },
  base_price_estimasi: { type: Number, default: 0 }
});
// Indeks unik untuk gabungan 3 kolom
MaterialSchema.index({ name: 1, type: 1, size: 1 }, { unique: true });

module.exports = mongoose.model('Material', MaterialSchema);