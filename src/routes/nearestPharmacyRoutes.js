const express = require('express');
const router = express.Router();
const nearestPharmacyController = require('../controllers/nearestPharmacyController');

router.post('/pharmacy/nearest', nearestPharmacyController.getNearestPharmacies);

module.exports = router;
