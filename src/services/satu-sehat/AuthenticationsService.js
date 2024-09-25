// src/api/satu-sehat/handler.js
const axios = require('axios');

class AuthenticationsService {
  // eslint-disable-next-line class-methods-use-this
  async fetchAccessToken(clientId, clientSecret) {
    try {
      const response = await axios.post('https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials', {
        client_id: clientId,
        client_secret: clientSecret,
        // grant_type: 'client_credentials',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }
}

module.exports = AuthenticationsService;
