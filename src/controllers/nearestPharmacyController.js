const nearestPharmacyService = require('../services/nearestPharmacyService');

class NearestPharmacyController {
  async getNearestPharmacies(req, res, next) {
    try {
      const { zipcode } = req.body;

      if (!zipcode) {
        return res.status(400).json({
          success: false,
          error: 'Zipcode is required',
        });
      }

      // Validate zipcode format (5 digits)
      const zipcodeRegex = /^\d{5}$/;
      if (!zipcodeRegex.test(zipcode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid zipcode format. Must be 5 digits.',
        });
      }

      // Find nearest pharmacies
      const result = await nearestPharmacyService.findNearestPharmacies(zipcode);

      if (!result.found) {
        return res.status(200).json({
          success: true,
          message: 'No pharmacies found',
          count: 0,
          pharmacies: [],
        });
      }

      res.status(200).json({
        success: true,
        message: `Found ${result.count} nearest ${result.count === 1 ? 'pharmacy' : 'pharmacies'}`,
        userZipcode: zipcode,
        count: result.count,
        pharmacies: result.pharmacies,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NearestPharmacyController();
