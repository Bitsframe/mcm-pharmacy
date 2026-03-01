const supabase = require('../config/supabase');

class CheckService {
  async checkSimilarValue(value, tableName = 'your_table_name', columnName = 'your_column_name') {
    try {
      // Exact match query
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(columnName, value)
        .limit(1);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return {
        exists: data && data.length > 0,
        data: data && data.length > 0 ? data[0] : null,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CheckService();
