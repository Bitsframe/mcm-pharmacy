const supabase = require('../config/supabase');

class NearestPharmacyService {
  calculateZipcodeDifference(zip1, zip2) {
    const num1 = parseInt(zip1, 10);
    const num2 = parseInt(zip2, 10);
    
    if (isNaN(num1) || isNaN(num2)) return Infinity;
    
    return Math.abs(num1 - num2);
  }

  async findNearestPharmacies(userZipcode) {
    try {
      // Fetch all active pharmacies
      const { data, error } = await supabase
        .from('pharmacy')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          found: false,
          count: 0,
          pharmacies: [],
        };
      }

      // Calculate distance for each pharmacy
      const pharmaciesWithDistance = data
        .map(pharmacy => ({
          ...pharmacy,
          distance: this.calculateZipcodeDifference(userZipcode, pharmacy.zip_code)
        }))
        .filter(item => item.distance !== Infinity); // Filter out invalid zipcodes

      // Sort by distance (ascending) and take top 2
      pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);

      const nearest = pharmaciesWithDistance.slice(0, 2);

      return {
        found: nearest.length > 0,
        count: nearest.length,
        pharmacies: nearest.map(item => ({
          id: item.id,
          name: item.name,
          address: item.address,
          city: item.city,
          state: item.state,
          zip_code: item.zip_code,
          phone_number: item.phone_number,
          spanish_language_service: item.spanish_language_service,
          disabled_access: item.disabled_access,
          license_status: item.license_status,
          opening_hours: item.opening_hours,
          delivers: item.delivers,
          is_active: item.is_active,
          distance: item.distance,
        })),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NearestPharmacyService();
