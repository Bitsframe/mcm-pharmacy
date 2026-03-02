const supabase = require('../config/supabase');

// Helper function to normalize phone number to digits only
function getPhoneDigits(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// Helper function to normalize name for comparison
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim();
}

class PharmacyService {
  async checkStrongMatch(pharmacyData) {
    try {
      const { name, phoneNumber, address } = pharmacyData;
      const phoneDigits = getPhoneDigits(phoneNumber);
      const normalizedInputName = normalizeName(name);

      // Get all records that match zipcode (narrow down the search)
      const { data, error } = await supabase
        .from('pharmacy')
        .select('*')
        .eq('zip_code', address.zipcode);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          matchType: 'none',
          found: false,
          matches: [],
        };
      }

      // Filter for strong matches only
      const strongMatches = data.filter(item => {
        const dbPhoneDigits = getPhoneDigits(item.phone_number);
        const phoneMatch = dbPhoneDigits.slice(-10) === phoneDigits.slice(-10);
        
        const addressMatch = item.address && 
          address.streetAddress && 
          (item.address.toLowerCase().includes(address.streetAddress.toLowerCase()) ||
           address.streetAddress.toLowerCase().includes(item.address.toLowerCase()));
        
        const stateMatch = item.state === address.state;
        
        const normalizedDbName = normalizeName(item.name);
        const nameMatch = normalizedDbName.includes(normalizedInputName) || 
                         normalizedInputName.includes(normalizedDbName);

        // Strong Match Case 1: phone + zipcode + address + state (all 4 must match)
        const case1 = phoneMatch && addressMatch && stateMatch;
        
        // Strong Match Case 2: phone + zipcode + address + name (all 4 must match)
        const case2 = phoneMatch && addressMatch && nameMatch;

        return case1 || case2;
      });

      if (strongMatches.length > 0) {
        return {
          matchType: 'strong',
          found: true,
          matches: strongMatches,
        };
      }

      return {
        matchType: 'none',
        found: false,
        matches: [],
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PharmacyService();
