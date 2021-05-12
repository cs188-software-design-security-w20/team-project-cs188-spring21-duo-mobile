const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const crypto = require('crypto');
const { firebase } = require('../firebase-init.js');

const db = firebase.firestore();
require('dotenv').config();

const Spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${process.env.BASE_URL}/ext/spotify/oauth-callback`,
});

// Scopes to request.
const SPOTIFY_SCOPES = [
  'user-read-email',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-top-read',
];

/*
-- Request Params --
needs to be an authenticated request.

-- Response --
authorizeURL or error

Creates a url that can be visited by the client to link Spotify account with
your Hopscotch account.
*/
async function handleLink(req, res) {
  const state = crypto.randomBytes(20).toString('hex');
  // Store the state in a document for lookup later, store the corresponding user's email
  await db.collection('spotify_state').doc(state.toString()).set({
    email: req.locals.user.email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  const authorizeURL = Spotify.createAuthorizeURL(
    SPOTIFY_SCOPES,
    state.toString(),
  );
  return res.json({ authorizeURL });
}

/*
-- Request Params --
- code -- This is the actual code that can be used with the Spotify SDK to get the user's
          refresh token
- state -- This is the random string that we generated in the "link" route. It is used to
           figure out which user to associate these tokens with.

-- Response --
200 or error

Stores the user's spotify refresh tokens in our database.
*/
async function handleOauthCallback(req, res) {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      throw new Error('Missing Spotify code or state token.');
    }
    // If no error, figure out whose spotify data this is using the state parameter
    const spotifyStateRef = db.collection('spotify_state').doc(state);
    const userEmail = await spotifyStateRef.get().then((doc) => {
      const { email } = doc.data();
      return email;
    });

    await Spotify.authorizationCodeGrant(code, async (error, data) => {
      if (error) {
        throw error;
      }
      Spotify.setAccessToken(data.body.access_token);
      const { body: spotifyProfile } = await Spotify.getMe();

      // We have a Spotify refresh token now.
      const refreshToken = data.body.refresh_token;

      // Get spotify data and store in the user's document
      db.collection('user_metadata').doc(userEmail).update({
        spotify_refresh_token: refreshToken,
        spotify_profile: spotifyProfile,
      });
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

/*
-- Request Property --
  - user_spotify_refresh_token -- Requires the refresh_token so the Spotify API knows
                                  whose currently-playing data we are requesting.

-- Response --
  song or error
  See https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-the-users-currently-playing-track for shape of song object.
*/
async function handleCurrentlyPlaying(req, res) {
  try {
    Spotify.setRefreshToken(req.locals.user_spotify_refresh_token);
    await Spotify.refreshAccessToken().then((data, err) => {
      if (err) {
        throw err;
      } else {
        Spotify.setAccessToken(data.body.access_token);
      }
    });
    const song = await Spotify.getMyCurrentPlayingTrack().then(
      (data) => data.body.item,
    );
    return res.status(200).json({ song });
  } catch (e) {
    return res
      .status(500)
      .json({ error: `Something went wrong while fetching the data: ${e}` });
  }
}

/*
-- Request Locals Property --
  - user_email -- Requires the request.user_email property to be set so we know
                  which user to fetch token for. This is set in the authMiddleware.

  Attaches `user_spotify_refresh_token` property to the request that can be used downstream.
*/
async function spotifyTokenMiddleware(req, res, next) {
  try {
    req.locals.user_spotify_refresh_token = await db
      .collection('user_metadata')
      .doc(req.locals.user.email)
      .get()
      .then((doc) => doc.data().spotify_refresh_token);
    if (!req.locals.user_spotify_refresh_token) {
      throw new Error('No spotify token found.');
    }
    return next();
  } catch (e) {
    return res.status(400).json({
      message: "You don't seem to have linked your account with spotify yet.",
    });
  }
}

function getSpotifyRoutes() {
  const router = express.Router();
  router.get('/link', handleLink);
  router.get('/currently-playing', spotifyTokenMiddleware, handleCurrentlyPlaying);
  return router;
}

function getSpotifyExternalRoutes() {
  const router = express.Router();
  // oauth-callback route doesn't have authMiddleware since it is called by Spotify
  router.get('/oauth-callback', handleOauthCallback);
  return router;
}

module.exports = {
  getSpotifyRoutes,
  getSpotifyExternalRoutes,
};
