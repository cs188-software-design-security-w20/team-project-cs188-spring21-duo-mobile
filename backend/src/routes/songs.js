const express = require("express");
const firebase = require("../firebase-init.js");
const geofire = require("geofire-common");
const db = firebase.firestore();

function getSongRoutes() {
  const router = express.Router();
  router.post("/", handleSong);
  router.get("/nearby", handleNearbySongs);
  return router;
}

async function handleSong(req, res) {
  console.log(req.body);
  let { lat, lng, songId } = req.body;
  if (!lat || !lng || !songId) {
    return res.status(400).send("Insufficient info");
  }
  // TODO: Add data validation
  const result = await db.collection("songEntries").add({
    songId,
    locationHash: geofire.geohashForLocation([lat, lng]),
    lat,
    lng,
  });
  return res.status(200).send(result.id);
}

async function handleNearbySongs(req, res) {
  let { lat, lng } = req.query;
  // TODO: Add data validation
  if (!lat || !lng) {
    return res.status(400).send("Insufficient info");
  }
  try {
    lat = Number(lat);
    lng = Number(lng);
  } catch (err) {
    return res.status(400).send("Invalid location");
  }
  const center = [lat, lng];
  const radiusInKm = 25;
  const bounds = geofire.geohashQueryBounds(center, radiusInKm);
  const promises = [];
  for (const b of bounds) {
    const q = db
      .collection("songEntries")
      .orderBy("locationHash")
      .startAt(b[0])
      .endAt(b[1]);
    promises.push(q.get());
  }
  Promise.all(promises)
    .then((snapshots) => {
      const matchingDocs = [];
      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const dCenter = [doc.get("lat"), doc.get("lng")];
          const distInKm = geofire.distanceBetween(dCenter, center);
          if (distInKm <= radiusInKm) {
            matchingDocs.push(doc);
          }
        }
      }
      return matchingDocs;
    })
    .then((matchingDocs) => {
      res.status(200).send(matchingDocs);
    });
}

module.exports = { getSongRoutes };
