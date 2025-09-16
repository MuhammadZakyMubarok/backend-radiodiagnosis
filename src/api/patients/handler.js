class PatientsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPatientHandler = this.postPatientHandler.bind(this);
    this.getAllPatientsHandler = this.getAllPatientsHandler.bind(this);
    this.getAllPatientHandler = this.getAllPatientHandler.bind(this);
    this.getPatientHandler = this.getPatientHandler.bind(this);
    this.putPatientHandler = this.putPatientHandler.bind(this);
    this.deletePatientByIdHandler = this.deletePatientByIdHandler.bind(this);
  }

  async postPatientHandler({ payload, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      const { idNumber } = payload;

      await this._service.verifyUserAccessRadiographer(credentialId);
      await this._service.verifyNewid_number(idNumber);

      const patientId = await this._service.addPatient(payload);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil ditambahkan',
        data: patientId,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async changeStatusPatientHandler({ payload, params, auth }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      const { patientId } = params;

      // Verifikasi akses pengguna
      await this._service.verifyUserAccessRadiographer(credentialId);

      // Ambil status_user saat ini dari database
      // eslint-disable-next-line max-len
      // const currentStatus = await this._service.getPatientById(patientId);

      // Tentukan status baru berdasarkan nilai status saat ini
      // const newStatus = currentStatus.status_user !== 1 ? 1 : 0;
      const newStatus = 1;

      // Perbarui status_user di database
      await this._service.updatePatientStatus(patientId, newStatus);
      await this._service.updatePatientRadiographerId(patientId, payload);

      const response = h.response({
        status: 'success',
        message: 'Status pasien berhasil diubah',
        data: { patientId, newStatus },
      });
      response.code(200);
      return response;
    } catch (error) {
      return error;
    }
  }

  async postPatientRegisterHandler(request, h) {
    try {
      const { idNumber } = request.payload;

      // Verifikasi ID number dan pendaftaran pasien
      await this._service.verifyNewid_number(idNumber);
      const patientId = await this._service.regisPatient(request.payload);

      return h
        .response({
          status: 'success',
          message: 'Anda berhasil register sebagai pasien',
          data: patientId,
        })
        .code(201);
    } catch (error) {
      console.error('Registration Error:', error);
      return h
        .response({
          status: 'fail',
          message: error.message || 'Pendaftaran gagal, silakan coba lagi.',
        })
        .code(500);
    }
  }

  async getAllPatientHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const patients = await this._service.getAllPatient();

      return {
        status: 'success',
        data: patients,
      };
    } catch (error) {
      return error;
    }
  }

  async getAllResultHandler({ auth, query }) {
    try {
      // Periksa jika auth.credentials tidak null sebelum destructuring
      if (!auth.credentials) {
        throw new Error('Authentication credentials are missing');
      }

      const { id: credentialId } = auth.credentials;

      // Validasi parameter query secara manual
      const {
        userId, month, limit, offset, search, verified,
      } = query;
      const parsedLimit = parseInt(limit, 10) || 10;
      const parsedOffset = parseInt(offset, 10) || 0;
      const parsedMonth = parseInt(month, 10) || null;
      const parsedVerified = verified === 'true' ? 1 : verified === 'false' ? 0 : null;

      // Verifikasi user access
      await this._service.verifyUserAccess(credentialId);

      // Panggil metode service dengan parameter query
      const result = await this._service.getAllResult(
        credentialId,
        parsedMonth,
        parsedLimit,
        parsedOffset,
        search,
        parsedVerified,
      );

      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'An error occurred',
      };
    }
  }

  async getAllPatientsHandler({ auth, query }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const page = query.page || 1;
      const { search } = query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const patients = await this._service.getAllPatients(
        limit,
        offset,
        search,
      );
      const {
        total, verified, unverified, thisDay, thisMonth,
      } = await this._service.getPatientTotalRows();

      return {
        status: 'success',
        data: patients,
        meta: {
          total,
          verified,
          unverified,
          thisDay,
          thisMonth,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      return error;
    }
  }

  async getPatientHandler({ auth, params }) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccess(credentialId);
      const { patientId } = params;
      const patient = await this._service.getPatientById(patientId);

      return {
        status: 'success',
        data: patient,
      };
    } catch (error) {
      return error;
    }
  }

  async putPatientHandler({ payload, auth, params }, h) {
    try {
      const { id: credentialId } = auth.credentials;
      await this._service.verifyUserAccessRadiographer(credentialId);

      const { patientId } = params;
      const patient = await this._service.editPatient(patientId, payload);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil diperbarui',
        data: patient,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }

  async deletePatientByIdHandler({ params, auth }, h) {
    try {
      const { patientId } = params;
      const { id: credentialId } = auth.credentials;

      await this._service.verifyUserAccessRadiographer(credentialId);
      const patient = await this._service.deletePatientById(patientId);

      const response = h.response({
        status: 'success',
        message: 'Pasien berhasil dihapus',
        data: patient,
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = PatientsHandler;
