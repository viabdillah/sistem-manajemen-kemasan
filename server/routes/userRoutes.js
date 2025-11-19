const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Definisi Route
// URL dasar nanti adalah: /api/users

router.get('/', getUsers);          // GET /api/users (Ambil semua)
router.post('/', createUser);       // POST /api/users (Tambah baru)
router.put('/:id', updateUser);     // PUT /api/users/:id (Edit)
router.delete('/:id', deleteUser);  // DELETE /api/users/:id (Hapus)

module.exports = router;