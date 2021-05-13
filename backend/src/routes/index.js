const express = require('express');

const {
  firebaseAuthMiddleware,
  twilioAuthMiddleware,
  getAuthRoutes,
} = require('./auth.js');
const { getSongRoutes } = require('./songs.js');
const { getSpotifyRoutes, getSpotifyExternalRoutes } = require('./spotify.js');
const { getUserRoutes } = require('./user.js');

function getRoutes() {
  const router = express.Router();
  router.use(firebaseAuthMiddleware);
  router.use('/auth', getAuthRoutes());
  // Twilio Middlware will only apply to routes below this statement
  router.use(twilioAuthMiddleware);
  router.use('/songs', getSongRoutes());
  router.use('/spotify', getSpotifyRoutes());
  router.use('/users', getUserRoutes());
  return router;
}

function getExternalRoutes() {
  const router = express.Router();
  router.use('/spotify', getSpotifyExternalRoutes());
  return router;
}

module.exports = { getRoutes, getExternalRoutes };
