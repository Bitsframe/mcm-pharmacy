const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { validatePharmacyRegistration } = require('../middleware/pharmacyValidator');

router.post('/pharmacy/check', validatePharmacyRegistration, pharmacyController.checkPharmacy);

module.exports = router;
