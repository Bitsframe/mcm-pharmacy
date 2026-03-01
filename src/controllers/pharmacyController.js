const pharmacyService = require('../services/pharmacyService');

class PharmacyController {
  async checkPharmacy(req, res, next) {
    try {
      const { name, phoneNumber, address } = req.body;

      // Check for strong match first, then similar matches
      const result = await pharmacyService.checkStrongMatch({
        name,
        phoneNumber,
        address,
      });

      if (result.found) {
        const message = result.matchType === 'strong' 
          ? 'Strong match found (phone + zipcode + address + state)'
          : 'Similar matches found';

        return res.status(200).json({
          success: true,
          matchFound: true,
          matchType: result.matchType,
          message,
          data: result.matches,
        });
      }

      res.status(200).json({
        success: true,
        matchFound: false,
        matchType: 'none',
        message: 'No match found',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PharmacyController();
