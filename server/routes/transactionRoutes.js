const express = require('express');
const router = express.Router();
// Import fungsi baru
const { 
    createTransaction, 
    getTransactionDetail, 
    getAllTransactions, 
    updateOrderStatus 
} = require('../controllers/transactionController');

// URL dasar: /api/transactions

router.post('/', createTransaction);
router.get('/', getAllTransactions); // <--- Route Baru (Get All)
router.get('/:id', getTransactionDetail);
router.patch('/:id/status', updateOrderStatus); // <--- Route Baru (Update Status)

module.exports = router;