// src/api/satu-sehat/authentications/route.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/satu-sehat/access-token',
    handler: handler.getAccessTokenHandler,
    options: {
      auth: false, // Adjust according to your authentication needs
    },
  },
];

module.exports = routes;
