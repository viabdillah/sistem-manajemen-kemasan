const PackagingType = require('../models/PackagingType');

// 1. Ambil Semua Jenis Kemasan (READ)
exports.getPackagingTypes = async (req, res) => {
  try {
    const types = await PackagingType.find().sort({ name: 1 });
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil jenis kemasan.', error: error.message });
  }
};

// 2. Tambah Jenis Kemasan Baru (CREATE)
exports.createPackagingType = async (req, res) => {
  try {
    // Ambil 'sizes' juga dari body
    const { name, description, sizes } = req.body;

    const exists = await PackagingType.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Jenis kemasan ini sudah ada.' });
    }

    // Simpan dengan sizes
    const newType = await PackagingType.create({ name, description, sizes });
    res.status(201).json({ message: 'Jenis kemasan berhasil ditambahkan.', type: newType });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan jenis kemasan.', error: error.message });
  }
};

// 3. Update Jenis Kemasan (UPDATE)
exports.updatePackagingType = async (req, res) => {
  try {
    // Ambil 'sizes' juga dari body
    const { name, description, sizes } = req.body;
    const typeId = req.params.id;

    const updatedType = await PackagingType.findByIdAndUpdate(
      typeId,
      { name, description, sizes }, // Update field sizes
      { new: true, runValidators: true }
    );

    if (!updatedType) {
      return res.status(404).json({ message: 'Jenis kemasan tidak ditemukan.' });
    }

    res.json({ message: 'Jenis kemasan berhasil diupdate.', type: updatedType });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate jenis kemasan.', error: error.message });
  }
};

// 4. Hapus Jenis Kemasan (DELETE)
exports.deletePackagingType = async (req, res) => {
  try {
    const deletedType = await PackagingType.findByIdAndDelete(req.params.id);
    
    if (!deletedType) {
      return res.status(404).json({ message: 'Jenis kemasan tidak ditemukan.' });
    }

    res.json({ message: 'Jenis kemasan berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus jenis kemasan.', error: error.message });
  }
};