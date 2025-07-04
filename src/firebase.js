// /src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCIEjocMDNBdyZgq0TPjphDe7BsSlxlECg",
  authDomain: "drivers-wallet-app.firebaseapp.com",
  databaseURL: "https://drivers-wallet-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "drivers-wallet-app",
  storageBucket: "drivers-wallet-app.appspot.com",
  messagingSenderId: "771166387647",
  appId: "1:771166387647:web:465f9809205fdc5438750a",
  measurementId: "G-570L8P1VKB"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Setup Realtime Database
const db = getDatabase(app);

// ✅ Setup Firebase Auth
const auth = getAuth(app);

// ✅ Export for use in App.js
export {
  db,
  ref,
  push,
  onValue,
  remove,
  set,
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
