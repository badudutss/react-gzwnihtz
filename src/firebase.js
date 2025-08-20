// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCil-Qi2IYPzdkWSTvJRj2LdEwTVtXxHao",
  authDomain: "wallet-driver-1fa85.firebaseapp.com",
  databaseURL: "https://wallet-driver-1fa85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wallet-driver-1fa85",
  storageBucket: "wallet-driver-1fa85.firebasestorage.app",
  messagingSenderId: "767103242077",
  appId: "1:767103242077:web:52b80303b803e0abd222b4",
  measurementId: "G-FDHT14K0EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
