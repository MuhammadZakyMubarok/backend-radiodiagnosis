// src/api/satu-sehat/patients/route.js
const routes = (handler) => [
  {
    method: 'GET',
    path: '/satu-sehat/Patient/by-nik',
    handler: handler.getPatientByNIKHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
  {
    method: 'GET',
    path: '/satu-sehat/Patient/by-nik-ibu',
    handler: handler.getPatientByNIKIbuHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
  {
    method: 'GET',
    path: '/satu-sehat/Patient/by-name-birthdate-identifier',
    handler: handler.getPatientByNameBirthdateIdentifierHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
  {
    method: 'GET',
    path: '/satu-sehat/Patient/by-name-birthdate-gender',
    handler: handler.getPatientByNameBirthdateGenderHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
  {
    method: 'GET',
    path: '/satu-sehat/Patient/{patientId}',
    handler: handler.getPatientByIdHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
  {
    method: 'POST',
    path: '/satu-sehat/Patient',
    handler: handler.registerPatientHandler,
    options: {
      auth: 'satu_sehat_bearer',
    },
  },
];

module.exports = routes;
