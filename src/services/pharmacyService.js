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

      console.log('🔍 Checking pharmacy match:');
      console.log('   Phone digits:', phoneDigits);
      console.log('   Zipcode:', address.zipcode);
      console.log('   State:', address.state);
      console.log('   Address:', address.streetAddress);

      // Get all records that match zipcode (narrow down the search)
      const { data, error } = await supabase
        .from('pharmacy')
        .select('*')
        .eq('zip_code', address.zipcode);

      console.log('📊 Supabase query result:');
      console.log('   Error:', error);
      console.log('   Records found:', data?.length || 0);
      
      if (error) {
        console.error('❌ Supabase error:', error);
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

        console.log(`   Checking record ID ${item.id}:`, {
          phoneMatch,
          addressMatch,
          stateMatch,
          nameMatch,
          dbPhone: item.phone_number,
          dbAddress: item.address,
          dbState: item.state,
          dbName: item.name
        });

        // Strong Match Case 1: phone + zipcode + address + state (all 4 must match)
        const case1 = phoneMatch && addressMatch && stateMatch;
        
        // Strong Match Case 2: phone + zipcode + address + name (all 4 must match)
        const case2 = phoneMatch && addressMatch && nameMatch;

        return case1 || case2;
      });

      console.log('✅ Strong matches found:', strongMatches.length);

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
