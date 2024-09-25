// src/api/satu-sehat/authentications/index.js
const SatuSehatAuthenticationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'satu-sehat-authentication',
  version: '1.0.0',
  register: async (server, { satuSehatAuthenticationService }) => {
    // eslint-disable-next-line max-len
    const satuSehatAuthenticationHandler = new SatuSehatAuthenticationHandler(satuSehatAuthenticationService);
    server.route(routes(satuSehatAuthenticationHandler));
  },
};
