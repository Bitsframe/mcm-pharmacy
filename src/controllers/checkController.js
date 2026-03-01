const checkService = require('../services/checkService');

class CheckController {
  async checkValue(req, res, next) {
    try {
      const { value } = req.body;
      
      // Hardcode your table and column names here
      const tableName = 'your_table_name';
      const columnName = 'your_column_name';

      const result = await checkService.checkSimilarValue(value, tableName, columnName);

      res.status(200).json({
        success: true,
        exists: result.exists,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckController();
