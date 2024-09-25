// src/api/satu-sehat/patients/handler.js
const axios = require('axios');

class SatuSehatPatientsService {
  constructor() {
    this.baseURL = process.env.SATU_SEHAT_BASE_URL;
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientById(patientId, authorization) {
    try {
      const response = await axios.get(`${this.baseURL}/Patient/${patientId}`, {
        headers: {
          Authorization: authorization,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }
}

module.exports = SatuSehatPatientsService;
