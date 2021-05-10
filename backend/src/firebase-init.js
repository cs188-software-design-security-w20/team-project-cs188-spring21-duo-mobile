const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('@firebase/auth');
require('@firebase/analytics');
require('firebase/firestore');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.GOOGLE_CREDENTIALS_TYPE,
    project_id: process.env.GOOGLE_CREDENTIALS_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CREDENTIALS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CREDENTIALS_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CREDENTIALS_AUTH_URI,
    token_uri: process.env.GOOGLE_CREDENTIALS_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CREDENTIALS_CLIENT_X509_CERT_URL,
  }),
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'hopscotch-ddd21.firebaseapp.com',
  projectId: 'hopscotch-ddd21',
  storageBucket: 'hopscotch-ddd21.appspot.com',
  messagingSenderId: '611116265466',
  appId: '1:611116265466:web:15ad2e7e463293a8b67e43',
  measurementId: 'G-X0KLXFSKM8',
};

firebase.initializeApp(firebaseConfig);

module.exports = { firebase, admin };
