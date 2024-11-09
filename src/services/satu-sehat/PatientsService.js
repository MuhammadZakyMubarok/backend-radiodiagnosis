// src/api/satu-sehat/patients/handler.js
const axios = require('axios');

class SatuSehatPatientsService {
  constructor() {
    this.baseURL = process.env.SATU_SEHAT_BASE_URL;
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientByNIK(params, authorization) {
    const { nik } = params;
    try {
      const response = await axios.get(`${this.baseURL}/Patient`, {
        params: {
          identifier: `https://fhir.kemkes.go.id/id/nik|${nik}`,
        },
        headers: {
          Authorization: authorization,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientByNIKIbu(params, authorization) {
    const { nik } = params;
    try {
      const response = await axios.get(`${this.baseURL}/Patient`, {
        params: {
          identifier: `https://fhir.kemkes.go.id/id/nik-ibu|${nik}`,
        },
        headers: {
          Authorization: authorization,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientByNameBirthdateIdentifier(params, authorization) {
    const { name, birthday, identifier } = params;
    try {
      const response = await axios.get(`${this.baseURL}/Patient`, {
        params: {
          name,
          birthday,
          identifier,
        },
        headers: {
          Authorization: authorization,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientByNameBirthdateGender(params, authorization) {
    const { name, birthday, gender } = params;
    try {
      const response = await axios.get(`${this.baseURL}/Patient`, {
        params: {
          name,
          birthday,
          gender,
        },
        headers: {
          Authorization: authorization,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch access token: ${error.message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getPatientById(params, authorization) {
    const { patientId } = params;
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
