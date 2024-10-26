// src/api/satu-sehat/patients/route.js
const routes = (handler) => [
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
