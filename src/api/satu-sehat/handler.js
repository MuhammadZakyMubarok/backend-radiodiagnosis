// src/api/satu-sehat/handler.js
class SatuSehatHandler {
  constructor(service) {
    this._service = service;

    this.getAccessTokenHandler = this.getAccessTokenHandler.bind(this);
  }

  async getAccessTokenHandler(request, h) {
    try {
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

module.exports = SatuSehatHandler;
