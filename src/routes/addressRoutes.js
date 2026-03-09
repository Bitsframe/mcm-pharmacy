const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Get address suggestions
router.get('/address/suggestions', addressController.getAddressSuggestions);

// Check Smarty API status
router.get('/address/status', addressController.checkStatus);

module.exports = router;
