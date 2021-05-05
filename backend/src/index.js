const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const { getRoutes } = require("./routes/index.js");

function startServer({ port = process.env.PORT } = {}) {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use("/api", getRoutes());
  app.get("/test", (req, res) => {
    console.log("test");
    res.send("test");
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Listening on port ${server.address().port}`);
      const closeFunction = server.close.bind(server);
      server.close = () => {
        return new Promise((resolveClose) => {
          closeFunction(resolveClose);
        });
      };
      handleTerminate(server);
      resolve(server);
    });
  });
}

function handleTerminate(server) {
  async function exitHandler(options = {}) {
    await server
      .close()
      .then(() => {
        console.log("Server successfully closed");
      })
      .catch((e) => {
        console.log("Something went wrong closing the server");
      });
    if (options.exit) process.exit();
  }
  process.on("exit", exitHandler);
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}

startServer();
