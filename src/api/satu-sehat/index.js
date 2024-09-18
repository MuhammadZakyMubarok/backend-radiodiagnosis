// src/api/satu-sehat/index.js
const SatuSehatHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'satu-sehat',
  version: '1.0.0',
  register: async (server, { satuSehatService }) => {
    const satuSehatHandler = new SatuSehatHandler(satuSehatService);
    server.route(routes(satuSehatHandler));
  },
};
