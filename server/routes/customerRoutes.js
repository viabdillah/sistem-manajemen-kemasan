const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, getCustomerDetail } = require('../controllers/customerController');

// URL dasar: /api/customers

router.post('/', createCustomer); // Mendaftarkan pelanggan baru
router.get('/', getCustomers);
router.get('/:id', getCustomerDetail);

module.exports = router;