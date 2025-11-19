const express = require('express');
const router = express.Router();
const { 
  getPackagingTypes, 
  createPackagingType, 
  updatePackagingType, 
  deletePackagingType 
} = require('../controllers/packagingTypeController');

// URL dasar: /api/packaging-types

router.get('/', getPackagingTypes); 
router.post('/', createPackagingType);
router.put('/:id', updatePackagingType);
router.delete('/:id', deletePackagingType);

module.exports = router;