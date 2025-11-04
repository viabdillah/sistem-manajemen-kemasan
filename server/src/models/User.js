const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firebase_uid: { type: String, required: true, unique: true, index: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Role' // Ini adalah "Foreign Key"
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);