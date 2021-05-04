const firebase = require("firebase/app");
require("@firebase/auth");
require("@firebase/analytics");
require("firebase/firestore");
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "hopscotch-ddd21.firebaseapp.com",
  projectId: "hopscotch-ddd21",
  storageBucket: "hopscotch-ddd21.appspot.com",
  messagingSenderId: "611116265466",
  appId: "1:611116265466:web:15ad2e7e463293a8b67e43",
  measurementId: "G-X0KLXFSKM8",
};

firebase.initializeApp(firebaseConfig);

module.exports = firebase;