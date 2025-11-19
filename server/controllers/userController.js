const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. AMBIL SEMUA USER (READ)
exports.getUsers = async (req, res) => {
  try {
    // Ambil semua data, tapi jangan kirim field password (bahaya)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. TAMBAH USER BARU (CREATE)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role, namaLengkap } = req.body;

    // Cek apakah username sudah ada?
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke Database
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      namaLengkap
    });

    res.status(201).json({ message: 'User berhasil dibuat', user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE USER (UPDATE)
exports.updateUser = async (req, res) => {
  try {
    const { namaLengkap, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Update data standar
    user.namaLengkap = namaLengkap || user.namaLengkap;
    user.role = role || user.role;

    // Jika password diisi, hash ulang. Jika kosong, biarkan password lama.
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({ message: 'User berhasil diupdate', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS USER (DELETE)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await user.deleteOne();
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};