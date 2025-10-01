// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBlMKluC2iPqcV0-EY0UVsWU3GbgPLf-Rg",
  authDomain: "to-do-app-bf3c9.firebaseapp.com",
  projectId: "to-do-app-bf3c9",
  storageBucket: "to-do-app-bf3c9.appspot.com",   // ✅ fixed
  messagingSenderId: "254220267557",
  appId: "1:254220267557:web:39896827836e7e9aba4fcc",
  measurementId: "G-RH4B8GMFD7"
};

const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional
try {
  getAnalytics(app);
} catch (e) {
  console.log("Analytics not supported in this environment");
}
