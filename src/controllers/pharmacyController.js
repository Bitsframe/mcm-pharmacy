const pharmacyService = require('../services/pharmacyService');

class PharmacyController {
  async checkPharmacy(req, res, next) {
    try {
      console.log('🎯 Controller: checkPharmacy called');
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      
      const { name, phoneNumber, address } = req.body;

      console.log('🔄 Calling pharmacyService.checkStrongMatch...');
      
      // Check for strong match first, then similar matches
      const result = await pharmacyService.checkStrongMatch({
        name,
        phoneNumber,
        address,
      });

      console.log('✅ Service returned result:', { 
        found: result.found, 
        matchType: result.matchType,
        matchCount: result.matches?.length || 0 
      });

      if (result.found) {
        const message = result.matchType === 'strong' 
          ? 'Strong match found (phone + zipcode + address + state)'
          : 'Similar matches found';

        console.log('📤 Sending success response');
        return res.status(200).json({
          success: true,
          matchFound: true,
          matchType: result.matchType,
          message,
          data: result.matches,
        });
      }

      console.log('📤 Sending no match response');
      res.status(200).json({
        success: true,
        matchFound: false,
        matchType: 'none',
        message: 'No match found',
        data: null,
      });
    } catch (error) {
      console.error('❌ Controller error:', error);
      next(error);
    }
  }
}

module.exports = new PharmacyController();
