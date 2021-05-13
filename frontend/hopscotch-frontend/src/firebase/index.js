import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebase from "firebase/app";
import { firebaseConfig } from "./firebase-config";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
