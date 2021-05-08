/* eslint-disable no-console */

const express = require('express');
const { uuid } = require('uuidv4');
const { firebase, admin } = require('../firebase-init.js');
const client = require('../twilio-init.js');

const db = firebase.firestore();
require('dotenv').config();

/*
-- Request Headers --
login_token: generated on client-side via firebase.auth().currentUser.getIdToken(true)
two_fac_token: received from this server after passing 2-fac

Parse the login token via Firebase Admin API. Get the email. Get the two-fac token
associated with this email in 2fac db. Check that this two-fac token matches the
two-fac token received in the headers. If all's well, user checks out.
*/
async function authMiddleware(req, res, next) {
  const [loginToken, twoFacToken] = [
    req.headers.login_token,
    req.headers.two_fac_token,
  ];

  if (loginToken == null || twoFacToken == null) {
    console.log('auth tokens not found');
    return res.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(loginToken);
    const firebaseRes = await db.collection('2_fac')
      .doc(decodedToken.email)
      .get();
    const twoFacEntry = firebaseRes.data();
    if (twoFacToken === twoFacEntry.token) {
      return next();
    }
    return res.status(401).send({ error: 'Unauthorized' });
  } catch (_) {
    console.log("couldn't get a 2fac entry");
    return res.status(401).send({ error: 'Unauthorized' });
  }
}

/*
-- Request Body --
email, password, phone

-- Response --
None other than 200 response status if success

Once user registers through the Firebase authentication API on the frontend,
a POST request hits this endpoint to create the corresponding user metadata
document in Firestore.
*/
async function handleRegister(req, res) {
  const { email, password, phone } = req.body;
  if (!email || !password || !phone) {
    return res.status(400).send({ error: 'Insufficient info' });
  }
  db.collection('user_metadata').doc(email).set({
    phone,
    spotify_refresh_token: null,
  });
  return res.status(200).send();
}

/*
-- Request Body --
idToken: this is the token returned from the Firebase authentication API
from the frontend by doing firebase.auth().currentUser.getIdToken(true).

-- Response --
sessionId or error

Check if firebase id token is valid through firebase admin API. If so,
establish a new 2-fac session by creating a new document in 2_fac with
- sessionId: uuid generated for the server and the user to keep
track of this transaction
- code: the 4-digit code the user should enter
- token: uuid generated to give to the user once they pass 2-fac auth
to authenticate into other endpoints
*/
async function handleLogin(req, res) {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).send({ error: 'Missing token' });
  }
  try {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(idToken);
    console.log(decodedToken);
    const { email } = decodedToken;
    if (!email) {
      return res.status(400).send({ error: 'Invalid token' });
    }
    const sessionId = uuid();
    /* generate code between 1000 and 9999 and stringify */
    const code = (
      Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    ).toString();
      /* this is the token the user will need to present in order to be fully authenticated
       * we will only hand over this token to client side when 2-factor authentication is complete
       */
    const token = uuid();
    db.collection('2_fac').doc(email).set({
      sessionId,
      code,
      token,
    });

    const firebaseRes = await db.collection('user_metadata')
      .doc(email)
      .get();
    const userMetadata = firebaseRes.data();
    try {
      const message = await client.messages
        .create({
          to: userMetadata.phone,
          from: process.env.TWILIO_REGISTERED_NUMBER,
          body: `Your hopscotch login code: ${code}`,
        });
      console.log(message.sid);
      return res.status(200).send({ sessionId });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error });
    }
  } catch (_) {
    return res.status(400).send({ error: 'Invalid token' });
  }
}

/*
-- Request Body --
email, sessionId, code

-- Response --
token or error

Check if session matches existing two-factor authentication session and that
the user entered code matches the code from this login session. If we pass
these checks then return the user the token they can use to make requests
to other endpoints.
*/
async function handle2FactorAuthentication(req, res) {
  const { email, sessionId, code } = req.body;
  if (!sessionId || !code) {
    return res.status(400).send({ error: 'Invalid request' });
  }
  try {
    const firebaseRes = await db.collection('2_fac')
      .doc(email)
      .get();
    const twoFacEntry = firebaseRes.data();
    if (sessionId === twoFacEntry.sessionId && code === twoFacEntry.code) {
      return res.status(200).send({ token: twoFacEntry.token });
    }
    return res.status(401).send({ error: 'Incorrect code' });
  } catch (_) {
    return res.status(401).send({ error: 'No session found' });
  }
}

function getAuthRoutes() {
  const router = express.Router();
  router.post('/register', handleRegister);
  router.post('/login', handleLogin);
  router.post('/2fac', handle2FactorAuthentication);
  return router;
}
module.exports = { authMiddleware, getAuthRoutes };
