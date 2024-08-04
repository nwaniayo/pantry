import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZN3B0jrYxOav20YZBedmtdNW8bkwQNxg",
  authDomain: "pantrytracker-19a26.firebaseapp.com",
  projectId: "pantrytracker-19a26",
  storageBucket: "pantrytracker-19a26.appspot.com",
  messagingSenderId: "253132895586",
  appId: "1:253132895586:web:adf73c8fd146c83021a83b",
  measurementId: "G-LK906FYPRN"
};

let firestore = null;
let analytics = null;

if (typeof window !== "undefined" && !getApps().length) {
  const app = initializeApp(firebaseConfig);
  firestore = getFirestore(app);
  analytics = getAnalytics(app);
}

export { firestore, analytics };