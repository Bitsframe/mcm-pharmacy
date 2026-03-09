const https = require('https');

class SmartyService {
  constructor() {
    this.authId = process.env.SMARTY_AUTH_ID;
    this.authToken = process.env.SMARTY_AUTH_TOKEN;
    this.baseUrl = 'us-autocomplete-pro.api.smarty.com';
  }

  async getAddressSuggestions(searchQuery, maxResults = 5) {
    if (!this.authId || !this.authToken) {
      throw new Error('Smarty credentials not configured');
    }

    if (!searchQuery || searchQuery.trim().length < 3) {
      throw new Error('Search query must be at least 3 characters');
    }

    return new Promise((resolve, reject) => {
      const path = `/lookup?auth-id=${this.authId}&auth-token=${this.authToken}&search=${encodeURIComponent(searchQuery)}&max_results=${maxResults}`;

      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const parsedData = JSON.parse(data);
              resolve(parsedData);
            } else if (res.statusCode === 401) {
              reject(new Error('Invalid Smarty credentials'));
            } else {
              reject(new Error(`Smarty API error: ${res.statusCode}`));
            }
          } catch (error) {
            reject(new Error('Failed to parse Smarty response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.end();
    });
  }

  formatSuggestions(smartyResponse) {
    if (!smartyResponse || !smartyResponse.suggestions) {
      return [];
    }

    return smartyResponse.suggestions.map(suggestion => ({
      streetLine: suggestion.street_line,
      secondary: suggestion.secondary || '',
      city: suggestion.city,
      state: suggestion.state,
      zipcode: suggestion.zipcode,
      fullAddress: `${suggestion.street_line}${suggestion.secondary ? ' ' + suggestion.secondary : ''}, ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`,
      entries: suggestion.entries || 0,
    }));
  }
}

module.exports = new SmartyService();
