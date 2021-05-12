const express = require('express');

const {
  firebaseAuthMiddleware,
  twilioAuthMiddleware,
  getAuthRoutes,
} = require('./auth.js');
const { getSongRoutes } = require('./songs.js');
const { getSpotifyRoutes, getSpotifyExternalRoutes } = require('./spotify.js');

function getRoutes() {
  const router = express.Router();
  router.use('/auth', firebaseAuthMiddleware, getAuthRoutes());
  router.use(
    '/songs',
    firebaseAuthMiddleware,
    twilioAuthMiddleware,
    getSongRoutes(),
  );
  router.use(
    '/spotify',
    firebaseAuthMiddleware,
    twilioAuthMiddleware,
    getSpotifyRoutes(),
  );
  return router;
}

function getExternalRoutes() {
  const router = express.Router();
  router.use('/spotify', getSpotifyExternalRoutes());
  return router;
}

module.exports = { getRoutes, getExternalRoutes };
