import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_DEMO_FIREBASE_API_KEY,
  authDomain: "hopscotch-ddd21.firebaseapp.com",
  projectId: "hopscotch-ddd21",
  storageBucket: "hopscotch-ddd21.appspot.com",
  messagingSenderId: "611116265466",
  appId: "1:611116265466:web:e68cd9d244a04673b67e43",
  measurementId: "G-BHE6YNHPRN",
};

if (!firebase.default.apps.length) {
  firebase.default.initializeApp(firebaseConfig);
  if (process.browser) {
    firebase.default
      .firestore()
      .enablePersistence()
      .catch((err) => {
        if (err.code == "failed-precondition") {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
        } else if (err.code == "unimplemented") {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
        }
      });
  }
}

export default firebase;
