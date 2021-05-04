const express = require("express");
const firebase = require('../firebase-init.js');

const db = firebase.firestore();

function getAuthRoutes() {
  const router = express.Router();
  router.post("/register", handleRegister);
  router.post("/login", handleLogin);
  return router;
}

async function handleRegister(req, res) {
  console.log(req.body);
  let { email, password, phone } = req.body;
  if (!email || !password || !phone) {
    return res.status(400).send("Insufficient info");
  }
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((_userCredentials) => {
      db.collection("user_metadata").add({
        email,
        phone,
        spotify_refresh_token: null,
      });
      res.status(200).send();
    })
    .catch((error) => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode, errorMessage);
      res.status(400).send("Invalid credentials");
    });
}

async function handleLogin(req, res) {
  // TODO (michaelywu54): implement login
  res.status(404).send("Not supported yet");
}

module.exports = { getAuthRoutes };
