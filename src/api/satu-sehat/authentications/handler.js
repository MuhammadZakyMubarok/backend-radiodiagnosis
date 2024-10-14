// src/api/satu-sehat/authentications/handler.js
class SatuSehatAuthenticationHandler {
  constructor(service) {
    this._service = service;

    this.getAccessTokenHandler = this.getAccessTokenHandler.bind(this);
  }

  async getAccessTokenHandler(request, h) {
    try {
      // eslint-disable-next-line camelcase
      const { client_id, client_secret } = request.payload;

      // Pass the parameters to the service for fetching the token
      const tokenData = await this._service.fetchAccessToken(client_id, client_secret);

      return h.response({
        status: 'success',
        data: tokenData,
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(500);
    }
  }
}

module.exports = SatuSehatAuthenticationHandler;
