const express = require('express');
const router = express.Router();
const checkController = require('../controllers/checkController');
const { validateCheckRequest } = require('../middleware/validator');

router.post('/check', validateCheckRequest, checkController.checkValue);

module.exports = router;
