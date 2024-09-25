// src/api/satu-sehat/patients/index.js
const SatuSehatPatientHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'satu-sehat-patient',
  version: '1.0.0',
  register: async (server, { satuSehatPatientService }) => {
    const satuSehatPatientHandler = new SatuSehatPatientHandler(satuSehatPatientService);
    server.route(routes(satuSehatPatientHandler));
    // Add auth bearer
    server.auth.default('satu_sehat_bearer');
  },
};
