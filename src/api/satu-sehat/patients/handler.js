// src/api/satu-sehat/patients/handler.js
class SatuSehatAuthenticationHandler {
  constructor(service) {
    this._service = service;

    this.getPatientByNIKHandler = this.getPatientByNIKHandler.bind(this);
    this.getPatientByNIKIbuHandler = this.getPatientByNIKIbuHandler.bind(this);
    // eslint-disable-next-line max-len
    this.getPatientByNameBirthdateIdentifierHandler = this.getPatientByNameBirthdateIdentifierHandler.bind(this);
    // eslint-disable-next-line max-len
    this.getPatientByNameBirthdateGenderHandler = this.getPatientByNameBirthdateGenderHandler.bind(this);
    this.getPatientByIdHandler = this.getPatientByIdHandler.bind(this);
  }

  async getPatientByNIKHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { nik } = params;
      const patient = await this._service.getPatientByNIK({
        nik,
      }, authorization);

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

  async getPatientByNIKIbuHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { nik } = params;
      const patient = await this._service.getPatientByNIKIbu({
        nik,
      }, authorization);

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

  async getPatientByNameBirthdateIdentifierHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { name, birthday, identifier } = params;
      const patient = await this._service.getPatientByNameBirthdateIdentifier({
        name,
        birthday,
        identifier,
      }, authorization);

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

  async getPatientByNameBirthdateGenderHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { name, birthday, gender } = params;
      const patient = await this._service.getPatientByNameBirthdateGender({
        name,
        birthday,
        gender,
      }, authorization);

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

  async getPatientByIdHandler({ params, headers }, h) {
    try {
      const { authorization } = headers;
      const { patientId } = params;
      const patient = await this._service.getPatientById({
        patientId,
      }, authorization);

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
