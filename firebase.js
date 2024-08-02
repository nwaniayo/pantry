// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZN3B0jrYxOav20YZBedmtdNW8bkwQNxg",
  authDomain: "pantrytracker-19a26.firebaseapp.com",
  projectId: "pantrytracker-19a26",
  storageBucket: "pantrytracker-19a26.appspot.com",
  messagingSenderId: "253132895586",
  appId: "1:253132895586:web:adf73c8fd146c83021a83b",
  measurementId: "G-LK906FYPRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};