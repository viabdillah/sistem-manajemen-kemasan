// server/src/controllers/inventoryController.js
const mongoose = require('mongoose');
const Material = require('../models/Material');
const MaterialHistory = require('../models/MaterialHistory');

/**
 * [GET] Mengambil semua daftar bahan (Stock Opname)
 * Versi Mongoose
 */
const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 }); // Urut A-Z
    
    // Format _id menjadi id
    const formattedMaterials = materials.map(m => ({
      id: m._id,
      name: m.name,
      type: m.type,
      size: m.size,
      quantity: m.quantity,
      unit: m.unit,
      base_price_estimasi: m.base_price_estimasi
    }));
    
    res.status(200).json(formattedMaterials);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data bahan' });
  }
};

/**
 * [POST] Menambah bahan baku baru ke master
 * Versi Mongoose
 */
const createNewMaterial = async (req, res) => {
  const { name, type, size, quantity, unit, base_price_estimasi } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ message: 'Nama dan Satuan bahan wajib diisi' });
  }
  try {
    await Material.create({
      name,
      type,
      size,
      quantity: quantity || 0,
      unit,
      base_price_estimasi: base_price_estimasi || 0
    });
    res.status(201).json({ message: 'Bahan baku baru berhasil ditambahkan' });
  } catch (error) {
    if (error.code === 11000) { // Error duplikat Mongoose
      return res.status(409).json({ message: 'Bahan dengan nama, jenis, dan ukuran ini sudah ada' });
    }
    res.status(500).json({ message: 'Gagal menambah bahan baku' });
  }
};

/**
 * [GET] Mengambil riwayat keluar/masuk bahan
 * Versi Mongoose
 */
const getMaterialHistory = async (req, res) => {
  try {
    const history = await MaterialHistory.find()
      .populate('material_id', 'name type size unit') // Data bahan
      .populate('recorded_by_user_id', 'full_name') // Nama pencatat
      .populate('order_id', 'order_number') // No. Pesanan
      .sort({ created_at: -1 });

    // Format data
    const formattedHistory = history.map(item => ({
      id: item._id,
      type: item.type,
      quantity: item.quantity,
      description: item.description,
      created_at: item.created_at,
      name: item.material_id ? item.material_id.name : 'Bahan Dihapus',
      material_type: item.material_id ? item.material_id.type : '-',
      size: item.material_id ? item.material_id.size : '-',
      unit: item.material_id ? item.material_id.unit : '-',
      recorded_by: item.recorded_by_user_id ? item.recorded_by_user_id.full_name : 'User Dihapus',
      order_number: item.order_id ? item.order_id.order_number : null,
      order_id: item.order_id ? item.order_id._id : null,
    }));
      
    res.status(200).json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat bahan' });
  }
};

/**
 * [POST] Menambah stok (Pemasukan) secara manual
 * Versi Mongoose
 */
const addMaterialStock = async (req, res) => {
  const { material_id, quantity, description } = req.body;
  const recorded_by_user_id = req.user.id;
  if (!material_id || !quantity) {
    return res.status(400).json({ message: 'ID Bahan dan Jumlah wajib diisi' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Tambah stok di tabel master
    await Material.findByIdAndUpdate(
      material_id,
      { $inc: { quantity: quantity } }, // $inc untuk menambah (atomic)
      { session }
    );

    // 2. Catat di tabel riwayat
    await MaterialHistory.create([{
      material_id,
      type: 'pemasukan',
      quantity,
      description,
      recorded_by_user_id
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Stok berhasil ditambahkan' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Gagal menambah stok' });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllMaterials,
  createNewMaterial,
  getMaterialHistory,
  addMaterialStock,
};