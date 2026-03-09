# Nearest Pharmacy Calculation Documentation

## Overview
The application includes a "Nearest Pharmacy" feature that suggests pharmacies to users based on their address. The calculation uses ZIP code proximity to determine the nearest pharmacies.

**Address Input:** The application uses **SmartyStreets Autocomplete API** to provide real-time address suggestions as users type, ensuring accurate and standardized addresses with valid ZIP codes.

---

## Architecture

### Components Involved

1. **NearestPharmacySection.tsx** - Main UI component for pharmacy selection
2. **logic.ts** - State management for pharmacy data
3. **index.tsx** - Integration of pharmacy section into the main form and address autocomplete
4. **Supabase `pharmacy` table** - Database storage for pharmacy information
5. **SmartyStreets API** - Address autocomplete and validation service

---

## How It Works

### 1. Data Flow

```
User types address → SmartyStreets suggests addresses → User selects → ZIP code extracted → Calculate distances → Display 2 nearest pharmacies
```

### 2. Address Autocomplete (SmartyStreets Integration)

**Location:** `index.tsx` - Address input with autocomplete

**API Endpoints:**
- `/api/address/status` - Check if SmartyStreets is configured
- `/api/address` - Get address suggestions

**How it works:**

1. **Lazy Integration Check:**
   - Only checks SmartyStreets integration when user starts typing
   - Caches the integration status to avoid repeated checks
   - If not integrated, autocomplete is silently disabled

2. **Debounced Search:**
   - Waits 300ms after user stops typing before fetching suggestions
   - Minimum 4 characters required to trigger search
   - Prevents excessive API calls

3. **Smart Suggestion Handling:**
   - Tracks last selected address to prevent re-fetching
   - Shows up to 5 address suggestions
   - Clears suggestions after selection

**Code Example:**
```typescript
// Check integration status (lazy)
const response = await fetch("/api/address/status");
const data = await response.json();
const integrated = Boolean(data?.integrated);

// Fetch suggestions (debounced 300ms)
const response = await fetch("/api/address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: query })
});

const data = await response.json();
setAddressSuggestions(data.suggestions);
```

**SmartyStreets API Configuration:**
- **Auth ID:** `process.env.SMARTY_AUTH_ID`
- **Auth Token:** `process.env.SMARTY_AUTH_TOKEN`
- **Endpoint:** `https://us-autocomplete-pro.api.smartystreets.com/lookup`
- **Max Results:** 5 suggestions

**Benefits:**
- Standardized address format
- Accurate ZIP codes for pharmacy calculation
- Reduced user input errors
- Better user experience

### 3. ZIP Code Extraction

**Location:** `NearestPharmacySection.tsx` - `extractZipcode()` function

```typescript
const extractZipcode = (address: string): string | null => {
    if (!address) return null;
    
    // Regex to match 5-digit or 5+4 digit zipcode
    const zipcodeRegex = /\b(\d{5})(?:-\d{4})?\b/;
    const match = address.match(zipcodeRegex);
    
    return match ? match[1] : null; // Return only 5-digit zipcode
};
```

**How it works:**
- Uses regex pattern to find ZIP codes in the address string
- Supports both 5-digit (e.g., "90210") and ZIP+4 formats (e.g., "90210-1234")
- Returns only the 5-digit portion for consistency
- Returns `null` if no ZIP code is found

---

### 4. Distance Calculation

**Location:** `NearestPharmacySection.tsx` - `calculateZipcodeDifference()` function

```typescript
const calculateZipcodeDifference = (zip1: string, zip2: string): number => {
    const num1 = parseInt(zip1, 10);
    const num2 = parseInt(zip2, 10);
    
    if (isNaN(num1) || isNaN(num2)) return Infinity;
    
    return Math.abs(num1 - num2);
};
```

**Algorithm:**
- Converts ZIP codes to integers
- Calculates absolute difference between the two numbers
- Returns `Infinity` for invalid ZIP codes (filters them out)

**Example:**
```
User ZIP: 90210
Pharmacy A ZIP: 90211 → Distance: 1
Pharmacy B ZIP: 90220 → Distance: 10
Pharmacy C ZIP: 91000 → Distance: 790
```

**Limitation:** This is a simple numeric difference, not true geographic distance. ZIP codes are not always sequential by location, so this is an approximation.

---

### 5. Finding Nearest Pharmacies

**Location:** `NearestPharmacySection.tsx` - `findNearestPharmacies()` function

```typescript
const findNearestPharmacies = (userZipcode: string, pharmacies: Pharmacy[]): Pharmacy[] => {
    if (!userZipcode || pharmacies.length === 0) return [];

    // Calculate distance for each pharmacy
    const pharmaciesWithDistance = pharmacies
        .map(pharmacy => ({
            pharmacy,
            distance: calculateZipcodeDifference(userZipcode, pharmacy.zip_code)
        }))
        .filter(item => item.distance !== Infinity); // Filter out invalid zipcodes

    // Sort by distance (ascending) and take top 2
    pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);

    return pharmaciesWithDistance.slice(0, 2).map(item => item.pharmacy);
};
```

**Process:**
1. Maps each pharmacy to include its calculated distance
2. Filters out pharmacies with invalid ZIP codes
3. Sorts by distance (closest first)
4. Returns the top 2 closest pharmacies

---

## State Management

### Location: `logic.ts`

```typescript
// Pharmacy information state
const [pharmacyName, setPharmacyName] = useState("");
const [pharmacyAddress, setPharmacyAddress] = useState("");
const [pharmacyPhone, setPharmacyPhone] = useState("");
const [pharmacyId, setPharmacyId] = useState<number | null>(null);
```

**State Variables:**
- `pharmacyName` - Selected pharmacy name
- `pharmacyAddress` - Full formatted address (address, city, state, ZIP)
- `pharmacyPhone` - Pharmacy phone number
- `pharmacyId` - Database ID of selected pharmacy (used for submission)

---

## Database Schema

### Pharmacy Table Structure

```typescript
interface Pharmacy {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone_number: string;
    spanish_language_service: boolean;
    disabled_access: boolean;
    license_status: string;
    opening_hours: any;
    delivers: boolean;
    is_active: boolean;
}
```

**Key Fields for Calculation:**
- `zip_code` - Used for distance calculation
- `is_active` - Only active pharmacies are shown
- `name` - Used for search functionality

---

## User Interface Features

### 1. Automatic Suggestions

**Trigger:** When user enters an address with a valid ZIP code

**Display:**
- Shows 2 nearest pharmacies as radio button options
- Appears under "Suggestions:" heading
- Only visible when no pharmacy is selected

### 2. Search Functionality

**Features:**
- Real-time search by pharmacy name
- Case-insensitive matching
- Minimum 2 characters required
- Dropdown shows all matching results
- Can be disabled when a pharmacy is already selected

### 3. Selected Pharmacy Display

**Shows:**
- Pharmacy name
- Phone number
- Full address (street, city, state, ZIP)
- Close button to deselect

---

## Data Submission

### Location: `logic.ts` - `submitAppointmentDetails()` function

```typescript
const response = await fetch('/api/create-encounter-intake', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        appointmentId,
        pharmacyId,  // ← Pharmacy ID is submitted here
        intakeFormData
    })
});
```

**What gets submitted:**
- Only the `pharmacyId` (database ID) is sent to the backend
- The backend can use this ID to retrieve full pharmacy details if needed
- Pharmacy data is associated with the encounter/intake record

---

## React Hooks & Effects

### 1. Fetch All Pharmacies (on mount)

```typescript
useEffect(() => {
    const fetchPharmacies = async () => {
        const { data, error } = await supabase
            .from('pharmacy')
            .select('id, name, address, city, state, zip_code, phone_number, is_active')
            .eq('is_active', true)
            .order('name', { ascending: true });
        
        setAllPharmacies(data || []);
    };
    
    fetchPharmacies();
}, []);
```

### 2. Update Suggestions (when address changes)

```typescript
useEffect(() => {
    if (allPharmacies.length === 0) return;

    const userZipcode = extractZipcode(userStreetAddress);
    
    if (userZipcode) {
        const nearest = findNearestPharmacies(userZipcode, allPharmacies);
        setSuggestedPharmacies(nearest);
    } else {
        setSuggestedPharmacies([]);
    }
}, [userStreetAddress, allPharmacies]);
```

**Triggers:**
- When `userStreetAddress` changes
- When `allPharmacies` is loaded

---

## Key Functions Summary

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `extractZipcode()` | Extract ZIP from address | Address string | 5-digit ZIP or null |
| `calculateZipcodeDifference()` | Calculate numeric distance | Two ZIP codes | Numeric difference |
| `findNearestPharmacies()` | Find closest pharmacies | User ZIP, pharmacy list | Top 2 pharmacies |
| `handleSearch()` | Filter pharmacies by name | Search query | Filtered results |
| `selectPharmacy()` | Set selected pharmacy | Pharmacy object | Updates state |
| `deselectPharmacy()` | Clear selection | None | Clears state |

---

---

## Example Flow

1. **User types:** "123 Main"
2. **SmartyStreets suggests:**
   - "123 Main St, Los Angeles, CA 90210"
   - "123 Main Ave, Beverly Hills, CA 90211"
   - "123 Main Blvd, Santa Monica, CA 90401"
3. **User selects:** "123 Main St, Los Angeles, CA 90210"
4. **ZIP extracted:** "90210"
5. **Distances calculated:**
   - CVS Pharmacy (90211) → Distance: 1
   - Walgreens (90212) → Distance: 2
   - Rite Aid (90220) → Distance: 10
6. **Top 2 displayed:**
   - CVS Pharmacy
   - Walgreens
7. **User selects:** CVS Pharmacy
8. **State updated:**
   - `pharmacyId`: 42
   - `pharmacyName`: "CVS Pharmacy"
   - `pharmacyAddress`: "456 Elm St, Los Angeles, CA, 90211"
   - `pharmacyPhone`: "(555) 123-4567"
9. **On submission:** `pharmacyId: 42` sent to backend

---

## Testing Considerations

### Test Cases

**Address Autocomplete:**
1. **Type less than 4 characters** → Should not fetch suggestions
2. **Type 4+ characters** → Should show SmartyStreets suggestions
3. **Select suggestion** → Should populate address field
4. **SmartyStreets not configured** → Should work without autocomplete
5. **API error** → Should fail gracefully, allow manual entry

**Pharmacy Suggestions:**
6. **Valid ZIP code in address** → Should show 2 suggestions
7. **No ZIP code in address** → Should show no suggestions
8. **Invalid ZIP code** → Should show no suggestions
9. **Search by name** → Should filter results
10. **Select pharmacy** → Should populate all fields
11. **Deselect pharmacy** → Should clear all fields
12. **Less than 2 pharmacies** → Should show available count
13. **No active pharmacies** → Should show empty state

---

## File Locations

- **Component:** `components/CSAForm/NearestPharmacySection.tsx`
- **State Management:** `components/CSAForm/logic.ts`
- **Integration:** `components/CSAForm/index.tsx` (includes address autocomplete)
- **API Endpoints:**
  - `/api/address` - SmartyStreets autocomplete (`src/app/api/address/route.ts`)
  - `/api/address/status` - Check SmartyStreets integration (`src/app/api/address/status/route.ts`)
  - `/api/create-encounter-intake` - Submit pharmacy selection
- **Database Table:** `pharmacy` (Supabase)
- **External Service:** SmartyStreets Autocomplete Pro API

---

## Dependencies

- **React** - Component framework
- **next-intl** - Internationalization
- **@supabase/supabase-js** - Database queries
- **Tailwind CSS** - Styling
- **SmartyStreets API** - Address autocomplete and validation
- **axios** - HTTP client for API requests

---

## Future Enhancements

1. **Geographic Distance Calculation**
   - Add lat/long to pharmacy table
   - Use Haversine formula for accurate distance
   - Display distance in miles/km

2.

3. **Map Integration**
   - Show pharmacies on a map
   - Get directions
   - Visual distance representation

4. **User Preferences**
   - Save preferred pharmacy
   - Pharmacy history
   - Custom sorting options


---

## SmartyStreets Integration Details

### Environment Variables Required

```bash
SMARTY_AUTH_ID=your_auth_id_here
SMARTY_AUTH_TOKEN=your_auth_token_here
```

### API Request Format

**Endpoint:** `POST /api/address`

**Request Body:**
```json
{
  "address": "123 Main"
}
```

**Response:**
```json
{
  "suggestions": [
    "123 Main St, Los Angeles, CA 90210",
    "123 Main Ave, Beverly Hills, CA 90211",
    "123 Main Blvd, Santa Monica, CA 90401"
  ]
}
```

### Integration Status Check

**Endpoint:** `GET /api/address/status`

**Response:**
```json
{
  "integrated": true
}
```

### Graceful Degradation

If SmartyStreets is not configured:
- Address autocomplete is disabled
- Users can still manually enter addresses
- ZIP code extraction still works
- Pharmacy suggestions still function

This ensures the application works even without the SmartyStreets integration.

---

## Performance Optimizations

### 1. Debouncing
- 300ms delay before API call
- Prevents excessive requests while typing
- Reduces API costs

### 2. Lazy Integration Check
- Only checks when user starts typing
- Caches result for session
- Avoids unnecessary API calls

### 3. Minimum Character Requirement
- Requires 4+ characters before search
- Reduces irrelevant suggestions
- Improves API efficiency

### 4. Smart Re-fetch Prevention
- Tracks last selected address
- Prevents re-fetching after selection
- Allows manual edits after delay

---

## Cost Considerations

### SmartyStreets Pricing
- Charged per API lookup
- Debouncing reduces call volume
- 4-character minimum reduces unnecessary calls
- Integration check is free (local env check)

### Optimization Tips
1. Increase debounce delay (currently 300ms)
2. Increase minimum character requirement (currently 4)
3. Reduce max_results (currently 5)
4. Cache common addresses (not implemented)

---

## Security Considerations

### API Key Protection
- Keys stored in environment variables
- Never exposed to client-side
- API routes act as proxy
- Server-side validation

### Rate Limiting
- Consider implementing rate limiting on `/api/address`
- Prevent abuse of SmartyStreets API
- Protect against excessive costs

---

## Troubleshooting

### Address Autocomplete Not Working

1. **Check environment variables:**
   ```bash
   echo $SMARTY_AUTH_ID
   echo $SMARTY_AUTH_TOKEN
   ```

2. **Check integration status:**
   ```bash
   curl http://localhost:3000/api/address/status
   ```

3. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/address \
     -H "Content-Type: application/json" \
     -d '{"address":"123 Main St"}'
   ```

4. **Check browser console:**
   - Look for API errors
   - Check network tab for failed requests

### Pharmacy Suggestions Not Showing

1. **Verify address has ZIP code:**
   - Check if address contains 5-digit ZIP
   - Test with known valid address

2. **Check pharmacy database:**
   ```sql
   SELECT COUNT(*) FROM pharmacy WHERE is_active = true;
   ```

3. **Verify ZIP codes in database:**
   ```sql
   SELECT name, zip_code FROM pharmacy WHERE is_active = true;
   ```

---

## API Response Examples

### SmartyStreets Autocomplete Response

**Raw API Response:**
```json
{
  "suggestions": [
    {
      "text": "123 Main St, Los Angeles, CA 90210",
      "street_line": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipcode": "90210"
    },
    {
      "text": "123 Main Ave, Beverly Hills, CA 90211",
      "street_line": "123 Main Ave",
      "city": "Beverly Hills",
      "state": "CA",
      "zipcode": "90211"
    }
  ]
}
```

**Processed Response (sent to client):**
```json
{
  "suggestions": [
    "123 Main St, Los Angeles, CA 90210",
    "123 Main Ave, Beverly Hills, CA 90211"
  ]
}
```

---

## Related Documentation

- [SmartyStreets Autocomplete Pro API](https://www.smarty.com/docs/cloud/us-autocomplete-pro-api)
- [React Debouncing Best Practices](https://www.freecodecamp.org/news/debouncing-explained/)
- [Haversine Formula for Distance](https://en.wikipedia.org/wiki/Haversine_formula) (for future geographic distance implementation)
