const express = require('express');

const { authMiddleware, getAuthRoutes } = require('./auth.js');
const { getSongRoutes } = require('./songs.js');
const { getSpotifyRoutes } = require('./spotify');

function getRoutes() {
  const router = express.Router();
  router.use('/auth', getAuthRoutes());
  router.use('/songs', authMiddleware, getSongRoutes());
  router.use('/spotify', getSpotifyRoutes());
  return router;
}

module.exports = { getRoutes };
