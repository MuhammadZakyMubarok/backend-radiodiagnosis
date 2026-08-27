class UploadsHandler {
  constructor(validator, patientsService, radiographicsService, storageService) {
    // this._service = service;
    this._validator = validator;
    this.postUploadPictureHandler = this.postUploadPictureHandler.bind(this);

    this._patientsService = patientsService;
    this._radiographicsService = radiographicsService;
    this._storageService = storageService;
  }

  // async postUploadPictureHandler({ payload }, h) {
  //   try {
  //     const { data } = payload;

  //     this._validator.validatePictureHeaders(data.hapi.headers);

  //     const filename = await this._service.writeFile(data, data.hapi);

  //     const response = h.response({
  //       status: 'success',
  //       message: 'Gambar berhasil diunggah',
  //       data: {
  //         pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`,
  //       },
  //     });
  //     response.code(201);
  //     return response;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  async postUploadPictureHandler({ request }, h) {
    try {
      const { data } = request.payload;

      this._validator.validatePictureHeaders(data.hapi.headers);

      const patientId = request.auth.credentials.id;

      const patient = await this._patientsService.getPatientById(patientId);
      const medicNumber = patient.medic_number;

      const dateNow = new Date().toISOString().slice(0, 10).replace(/-/g, '');

      const sequence = await this._radiographicsService.getNextSequenceNumber(patientId);

      const newFilename = `${medicNumber}_${dateNow}_${sequence}.jpg`;

      const meta = {
        filename: newFilename,
      };

      // 8. Lempar ke Storage Service untuk disimpan ke folder backend
      const filename = await this._storageService.writeFile(data, meta);

      const response = h.response({
        status: 'success',
        message: 'Gambar berhasil diunggah',
        data: {
          pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return error;
    }
  }
}

module.exports = UploadsHandler;
