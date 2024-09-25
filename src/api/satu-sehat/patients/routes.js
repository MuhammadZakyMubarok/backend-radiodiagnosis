// src/api/satu-sehat/patients/route.js
const routes = (handler) => [
  {
    method: 'GET',
    path: '/satu-sehat/patients/Patient/{patientId}',
    handler: handler.getPatientByIdHandler,
  },
];

module.exports = routes;
