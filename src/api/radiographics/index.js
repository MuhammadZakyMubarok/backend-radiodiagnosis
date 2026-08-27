const RadiographicsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'radiographics',
  version: '1.0.0',
  register: async (server, {
    radiographicsService, storageService, RadiographicsValidator, UploadsValidator, patientsService,
  }) => {
    const radiographicsHandler = new RadiographicsHandler(
      radiographicsService,
      storageService,
      RadiographicsValidator,
      UploadsValidator,
      patientsService,
    );
    server.route(routes(radiographicsHandler));
  },
};
