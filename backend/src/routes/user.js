const express = require('express');
const { firebase } = require('../firebase-init.js');

const db = firebase.firestore();

async function handleMe(req, res) {
  const user = await db.collection('user_metadata').doc(req.locals.user.email).get();
  if (!user.exists) {
    return res.status(404).send('User not found');
  }
  const entries = await db.collection('user_metadata')
    .doc(req.locals.user.email)
    .collection('song_entries')
    .get();
  const entriesArray = [];
  if (entries) {
    entries.forEach((entry) => {
      entriesArray.push(entry.data());
    });
  }

  return res.status(200).send({
    userData: user.data(),
    userEntries: entriesArray,
  });
}

function getUserRoutes() {
  const router = express.Router();
  router.get('/me', handleMe);
  return router;
}

module.exports = { getUserRoutes };
