// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <-- Impor bcrypt untuk hashing
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // 1. firebaseId telah dihapus. Email sekarang adalah ID login utama.
  
  full_name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, // <-- Tambahan: baik untuk konsistensi email
    index: true 
  },
  // 2. Field password baru untuk menyimpan HASH
  password: { type: String, required: true }, 
  
  role_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Role'
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },

  // 3. Field baru untuk alur "Lupa Kata Sandi" Anda
  passwordResetRequested: {
    type: Boolean,
    default: false
  },
  passwordResetRequestedAt: {
    type: Date,
    default: null
  }
});

// --- Middleware Hashing Password Otomatis ---
// Ini adalah "pre-save hook" dari Mongoose.
// Ini akan berjalan SECARA OTOMATIS setiap kali user.save() dipanggil
// dan field 'password' dimodifikasi (dibuat atau diubah).
UserSchema.pre('save', async function(next) {
  // Lewati jika password tidak diubah
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hasilkan "salt" untuk memperkuat hash
    const salt = await bcrypt.genSalt(10);
    // Hash password baru dengan salt
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// --- Metode untuk Perbandingan Password ---
// Ini menambahkan fungsi baru ke setiap dokumen User (misal: user.comparePassword())
// untuk membandingkan password yang masuk (login) dengan hash di database.
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};


module.exports = mongoose.model('User', UserSchema);