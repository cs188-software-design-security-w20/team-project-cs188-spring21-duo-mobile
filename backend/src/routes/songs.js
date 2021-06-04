const express = require('express');
const geofire = require('geofire-common');
const randomNumber = require('random-number-csprng');
const { firebase } = require('../firebase-init.js');

const db = firebase.firestore();

async function handleSong(req, res) {
  const { lat, lng, songData } = req.body;
  if (!lat || !lng || !songData) {
    return res.status(400).send('Insufficient info');
  }

  const perturbation = 0.0025;
  const latPerturb = await randomNumber(-1, 1);
  const lngPerturb = await randomNumber(-1, 1);
  let latitude = lat + latPerturb * perturbation;
  let longitude = lng + lngPerturb * perturbation;

  if (latitude > 90) latitude = 90;
  if (latitude < -90) latitude = -90;
  if (longitude > 180) longitude = 180;
  if (longitude < -180) longitude = -180;

  // TODO: Add data validation
  const songDoc = {
    songData,
    locationHash: geofire.geohashForLocation([latitude, longitude]),
    lat: latitude,
    lng: longitude,
    ts: firebase.firestore.FieldValue.serverTimestamp(),
  };
  const result = await db.collection('songEntries').add(songDoc);

  const userSongEntryRef = db
    .collection('user_metadata')
    .doc(req.locals.user.email)
    .collection('song_entries')
    .doc(result.id);

  return userSongEntryRef
    .set(songDoc)
    .then(() => res.status(200).send(result.id))
    .catch((e) => res.status(500).send(e));
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
    const metersIn25Miles = 40000;
    radius = radius ? Number(radius) : metersIn25Miles;
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
      result.push(doc.data());
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
