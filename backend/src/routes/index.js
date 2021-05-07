const express = require("express");

const { authMiddleware, getAuthRoutes } = require("./auth.js");
const { getSongRoutes } = require("./songs.js");

function getRoutes() {
  const router = express.Router();
  router.use("/auth", getAuthRoutes());
  router.use("/songs", authMiddleware, getSongRoutes());
  return router;
}

module.exports = { getRoutes };
