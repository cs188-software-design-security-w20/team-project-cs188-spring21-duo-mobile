const express = require("express");

const { getAuthRoutes } = require("./auth.js");

function getRoutes() {
  const router = express.Router();
  router.use("/auth", getAuthRoutes());
  return router;
}

module.exports = { getRoutes };
