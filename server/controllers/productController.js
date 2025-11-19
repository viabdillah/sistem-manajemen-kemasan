const Product = require('../models/Product');

// 1. Tambah Produk Baru (CREATE)
exports.createProduct = async (req, res) => {
  try {
    // Data dikirim dari frontend (termasuk customerId)
    const newProduct = await Product.create(req.body);
    
    res.status(201).json({ 
      message: 'Produk berhasil ditambahkan.', 
      product: newProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal menambahkan produk.', 
      error: error.message 
    });
  }
};

// 2. Ambil Produk berdasarkan Customer ID (READ)
// Hanya mengambil produk yang isDeleted: false (Aktif)
exports.getProductsByCustomer = async (req, res) => {
  try {
    const products = await Product.find({ 
      customerId: req.params.customerId,
      isDeleted: false // Filter penting untuk Soft Delete
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal mengambil data produk.', 
      error: error.message 
    });
  }
};

// 3. Update Produk (UPDATE)
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body, // Data baru yang dikirim dari form edit
      { new: true, runValidators: true } // Option agar mengembalikan data terbaru
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({ 
      message: 'Produk berhasil diupdate', 
      product: updatedProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal update produk', 
      error: error.message 
    });
  }
};

// 4. Soft Delete Produk (DELETE)
// Tidak menghapus fisik data, hanya mengubah flag isDeleted menjadi true
exports.softDeleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }, // Set flag dihapus
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({ 
      message: 'Produk berhasil dihapus (Soft Delete)',
      product: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal menghapus produk', 
      error: error.message 
    });
  }
};