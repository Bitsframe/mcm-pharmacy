const smartyService = require('../services/smartyService');

class AddressController {
  async getAddressSuggestions(req, res, next) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          error: 'Search parameter is required',
        });
      }

      // Get suggestions from Smarty API
      const smartyResponse = await smartyService.getAddressSuggestions(search);

      // Format the response
      const formattedSuggestions = smartyService.formatSuggestions(smartyResponse);

      res.status(200).json({
        success: true,
        count: formattedSuggestions.length,
        suggestions: formattedSuggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkStatus(req, res, next) {
    try {
      const authId = process.env.SMARTY_AUTH_ID;
      const authToken = process.env.SMARTY_AUTH_TOKEN;

      const isConfigured = !!(authId && authToken);

      res.status(200).json({
        success: true,
        enabled: isConfigured,
        message: isConfigured
          ? 'Smarty API is configured and ready'
          : 'Smarty API credentials not found',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
