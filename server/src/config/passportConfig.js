// server/src/config/passportConfig.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User'); // Model User kita
const Role = require('../models/Role'); // Untuk populate
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Opsi untuk memberi tahu Passport cara menemukan token
const options = {
  // Ekstrak token dari 'Authorization: Bearer <token>' header
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET // Kunci rahasia untuk memverifikasi token
};

// Ini adalah fungsi yang diekspor
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      // 'jwt_payload' adalah data yang kita 'sign' di authController (berisi payload.user)
      // { user: { id, email, role_name } }
      
      try {
        // 1. Ambil ID dari payload dan cari user di DB
        // Kita cari user di DB setiap request untuk data yang 'fresh'
        const user = await User.findById(jwt_payload.user.id).populate('role_id');

        if (user) {
          // 2. Jika user ditemukan, siapkan objek user untuk 'req.user'
          // Kita format ini agar SAMA PERSIS dengan format lama Anda
          // sehingga middleware role-check Anda tetap berfungsi
          const userObject = {
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            role_name: user.role_id ? user.role_id.name : null,
            is_active: user.is_active
          };
          
          // 3. Berhasil! Teruskan objek user ke 'req.user'
          return done(null, userObject); 
        } else {
          // User tidak ditemukan (mungkin dihapus)
          return done(null, false);
        }
      } catch (error) {
        console.error("Error di strategi Passport JWT:", error);
        return done(error, false);
      }
    })
  );
};