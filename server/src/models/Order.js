const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  order_number: { type: String, required: true, unique: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  cashier_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order_status: {
    type: String,
    enum: ['pending', 'design_queue', 'design_review', 'production_queue', 'in_production', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment_method: { type: String },
  payment_status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  total_amount: { type: Number, required: true },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  // Kita simpan items langsung di dalam order (Denormalisasi)
  items: [{
    product_name: { type: String, required: true },
    label_name: { type: String },
    pirt_number: { type: String },
    halal_number: { type: String },
    has_design: { type: Boolean, default: false },
    packaging_type: { type: String },
    quantity: { type: Number, required: true },
    price_per_pcs: { type: Number, required: true },
    notes: { type: String }
  }]
});

module.exports = mongoose.model('Order', OrderSchema);