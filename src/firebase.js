// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYTTVF4m1QInazKPtnqNXu4ekc_SOLYXQ",
  authDomain: "statspro-bc999.firebaseapp.com",
  projectId: "statspro-bc999",
  storageBucket: "statspro-bc999.appspot.com",
  messagingSenderId: "1099103495228",
  appId: "1:1099103495228:web:3e76c85e414d6636450f39",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export shared services
export const db = getFirestore(app);
export const auth = getAuth(app);
