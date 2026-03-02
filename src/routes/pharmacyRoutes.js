const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { validatePharmacyRegistration } = require('../middleware/pharmacyValidator');

console.log('🛣️  Pharmacy routes loaded');

router.post('/pharmacy/check', (req, res, next) => {
  console.log('🚀 Route: /api/pharmacy/check hit');
  next();
}, validatePharmacyRegistration, pharmacyController.checkPharmacy);

module.exports = router;
