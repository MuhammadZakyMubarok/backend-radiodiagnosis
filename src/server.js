/* eslint-disable no-console */
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./exceptions/ClientError');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// patients
const patients = require('./api/patients');
const PatientsService = require('./services/postgres/PatientsService');
const PatientsValidator = require('./validator/patients');

// radiographics
const radiographics = require('./api/radiographics');
const RadiographicsService = require('./services/postgres/RadiographicsService');
const RadiographicsValidator = require('./validator/radiographics');

// diagnoses
const diagnoses = require('./api/diagnoses');
const DiagnosesService = require('./services/postgres/DiagnosesService');

// SatuSehat
const satuSehatAuthentication = require('./api/satu-sehat/authentications');
const SatuSehatAuthenticationService = require('./services/satu-sehat/AuthenticationsService');
const satuSehatPatient = require('./api/satu-sehat/patients');
const SatuSehatPatientsService = require('./services/satu-sehat/PatientsService');

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/file/pictures'),
  );
  const patientsService = new PatientsService();
  const radiographicsService = new RadiographicsService();
  const diagnosesService = new DiagnosesService();

  // Satu sehat API
  const satuSehatAuthenticationService = new SatuSehatAuthenticationService();
  const satuSehatPatientService = new SatuSehatPatientsService();

  const isProd = process.env.NODE_ENV === 'production';

  const server = Hapi.server({
    port: process.env.PORT || 5001,
    host: isProd ? (process.env.PROD_HOST || '0.0.0.0') : (process.env.HOST || 'localhost'),
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Health check untuk kubernetes
  server.route({
    method: 'GET',
    path: '/healthz',
    handler: () => ({ status: 'ok' }),
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Auth Strategy
  server.auth.scheme('simple-bearer', () => ({
    authenticate: (request, h) => {
      const { authorization } = request.headers;

      if (!authorization) {
        return h.unauthenticated(new Error('Missing Authorization header'));
      }

      const parts = authorization.split(' ');
      if (parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
        return h.unauthenticated(new Error('Invalid Authorization header format'));
      }

      const token = parts[1];
      if (!token) {
        return h.unauthenticated(new Error('Missing Bearer token'));
      }

      return h.authenticated({ credentials: { token } });
    },
  }));

  server.auth.strategy('satu_sehat_bearer', 'simple-bearer');

  server.auth.strategy('radiodiagnostic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        usersService,
        storageService,
        UsersValidator,
        UploadsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: patients,
      options: {
        patientsService,
        PatientsValidator,
      },
    },
    {
      plugin: radiographics,
      options: {
        radiographicsService,
        storageService,
        RadiographicsValidator,
        UploadsValidator,
        patientsService,
      },
    },
    {
      plugin: diagnoses,
      options: {
        diagnosesService,
        radiographicsService,
      },
    },
    {
      plugin: satuSehatAuthentication,
      options: {
        satuSehatAuthenticationService,
      },
    },
    {
      plugin: satuSehatPatient,
      options: {
        satuSehatPatientService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      return newResponse;
    }

    if (response instanceof Error) {
      const newResponse = h.response({
        status: 'error',
        message: response.message,
      });

      newResponse.statusCode = 400;
      return newResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
