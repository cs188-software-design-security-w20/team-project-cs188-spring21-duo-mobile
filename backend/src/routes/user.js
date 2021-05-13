const express = require('express');
const { firebase } = require('../firebase-init.js');

const db = firebase.firestore();

async function handleMe(req, res) {
  const user = await db.collection('user_metadata').doc(req.locals.user.email).get();
  if (!user.exists) {
    return res.status(404).send('User not found');
  }
  return res.status(200).send(user.data());
}

function getUserRoutes() {
  const router = express.Router();
  router.get('/me', handleMe);
  return router;
}

module.exports = { getUserRoutes };
