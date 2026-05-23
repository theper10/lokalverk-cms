'use strict';

module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'dev-users-permissions-jwt-secret-change-me'),
    },
  },
});
