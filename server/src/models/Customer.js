const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // 'sparse' mengizinkan email null
  whatsapp_number: { type: String, required: true },
  production_address: { type: String },
  registered_by_user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema);