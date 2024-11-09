const routes = (handler) => [
  {
    method: 'POST',
    path: '/patients',
    handler: handler.postPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },

  {
    method: 'POST',
    path: '/patients/status/{patientId}/{status_user}',
    handler: handler.changeStatusPatientHandler.bind(handler),
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },

  {
    method: 'POST',
    path: '/patients/register',
    handler: handler.postPatientRegisterHandler.bind(handler),
    options: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/patients/detail/{patientId}',
    handler: handler.getPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patients/all',
    handler: handler.getAllPatientsHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patients/result-diagnoses',
    handler: handler.getAllResultHandler.bind(handler),
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/patient/all',
    handler: handler.getAllPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/patients/edit/{patientId}',
    handler: handler.putPatientHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/patients/delete/{patientId}',
    handler: handler.deletePatientByIdHandler,
    options: {
      auth: 'radiodiagnostic_jwt',
    },
  },
];
module.exports = routes;
