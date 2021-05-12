const express = require('express');

const {
  firebaseAuthMiddleware,
  twilioAuthMiddleware,
  getAuthRoutes,
} = require('./auth.js');
const { getSongRoutes } = require('./songs.js');
const { getSpotifyRoutes } = require('./spotify.js');

function getRoutes() {
  const router = express.Router();
  router.use('/auth', firebaseAuthMiddleware, getAuthRoutes());
  router.use(
    '/songs',
    firebaseAuthMiddleware,
    twilioAuthMiddleware,
    getSongRoutes(),
  );
  router.use('/spotify', getSpotifyRoutes());
  return router;
}

module.exports = { getRoutes };
