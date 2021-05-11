const express = require('express');
const geofire = require('geofire-common');
const moment = require('moment');
const { firebase } = require('../firebase-init.js');

const db = firebase.firestore();

async function handleSong(req, res) {
  const { lat, lng, songId } = req.body;
  const currTime = moment().unix();
  if (!lat || !lng || !songId) {
    return res.status(400).send('Insufficient info');
  }

  // TODO: Add data validation
  const result = await db.collection('songEntries').add({
    songId,
    locationHash: geofire.geohashForLocation([lat, lng]),
    lat,
    lng,
    ts: currTime,
  });

  const userRef = db.collection('user_metadata').doc(req.user_email);
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) {
        return res.status(404).send('User not found');
      }
      const newSongs = doc.data().song_entries;
      newSongs.push(result.id);
      return t.update(userRef, { song_entries: newSongs });
    });
  } catch (e) {
    return res.status(500).send('Unexpected issue');
  }
  return res.status(200).send(result.id);
}

async function handleNearbySongs(req, res) {
  let { lat, lng, radius } = req.query;
  // TODO: Add data validation
  if (!lat || !lng) {
    return res.status(400).send('Insufficient info');
  }
  try {
    lat = Number(lat);
    lng = Number(lng);
    radius = radius ? Number(radius) : 25;
  } catch (err) {
    return res.status(400).send('Invalid location');
  }
  const center = [lat, lng];
  const bounds = geofire.geohashQueryBounds(center, radius);
  const promises = bounds.map((b) => {
    const q = db
      .collection('songEntries')
      .orderBy('locationHash')
      .startAt(b[0])
      .endAt(b[1]);
    return q.get();
  });
  const snapshots = await Promise.all(promises);
  const matchingDocs = snapshots.flatMap((snap) => snap.docs.reduce((result, doc) => {
    const dCenter = [doc.get('lat'), doc.get('lng')];
    const distInKm = geofire.distanceBetween(dCenter, center);
    if (distInKm <= radius) {
      result.push(doc.data().songId);
    }
    return result;
  }, []));
  return res.status(200).send(matchingDocs);
}

function getSongRoutes() {
  const router = express.Router();
  router.post('/', handleSong);
  router.get('/nearby', handleNearbySongs);
  return router;
}

module.exports = { getSongRoutes };
