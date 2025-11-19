const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProductsByCustomer, 
  updateProduct,      // <--- Import baru
  softDeleteProduct   // <--- Import baru
} = require('../controllers/productController');

// URL: /api/products

router.post('/', createProduct);
router.get('/:customerId', getProductsByCustomer);

// Route baru untuk Edit dan Delete
router.put('/:id', updateProduct);      // Update berdasarkan ID Produk
router.delete('/:id', softDeleteProduct); // Delete berdasarkan ID Produk

module.exports = router;