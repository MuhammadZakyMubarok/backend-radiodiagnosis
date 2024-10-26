// src/api/satu-sehat/patients/handler.js
class SatuSehatAuthenticationHandler {
  constructor(service) {
    this._service = service;

    this.getPatientByIdHandler = this.getPatientByIdHandler.bind(this);
  }

  async getPatientByIdHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { patientId } = params;
      const patient = await this._service.getPatientById(patientId, authorization);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil didapatkan dari satu sehat',
        data: patient,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async registerPatientHandler(patientData) {
    // Validasi dan penyimpanan data
    if (!patientData.resourceType || patientData.resourceType !== 'Patient') {
      throw new Error('Invalid resourceType, must be "Patient"');
    }

    // Simpan data pasien
    const newPatient = {
      id: this._patients.length + 1,
      ...patientData,
    };

    this._patients.push(newPatient);
    return newPatient;
  }
  
}

module.exports = SatuSehatAuthenticationHandler;
