const Customer = require('../models/Customer');

// 1. Tambah Pelanggan Baru (POST)
exports.createCustomer = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    // Cek duplikasi nomor telepon
    const phoneExists = await Customer.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'Nomor telepon sudah terdaftar.' });
    }

    const newCustomer = await Customer.create({ name, address, phone });
    res.status(201).json({ message: 'Pelanggan berhasil didaftarkan.', customer: newCustomer });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mendaftarkan pelanggan.', error: error.message });
  }
};

// 2. Ambil Semua Pelanggan (READ)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelanggan.', error: error.message });
  }
};

// 3. Ambil Detail Pelanggan berdasarkan ID (READ Detail)
exports.getCustomerDetail = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail pelanggan.', error: error.message });
  }
};
