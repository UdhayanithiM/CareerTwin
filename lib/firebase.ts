// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ✨ 1. CORRECT FIREBASE CONFIGURATION
// These values MUST match your main 'careertwin' project in the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyD_WNGljcXH5jg9NwlgNW-Wi6jgt4mwRD4",
  authDomain: "careertwin.firebaseapp.com",
  projectId: "careertwin",
  storageBucket: "careertwin.firebasestorage.app",
  messagingSenderId: "604616653813",
  appId: "1:604616653813:web:60bc72630641fc107dbebc",
  measurementId: "G-X8GXSDJXYX"
};

// ✨ 2. SECURE INITIALIZATION FOR NEXT.JS
// This pattern prevents re-initializing the app on every hot reload.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✨ 3. EXPORT NEEDED SERVICES
// Export the Auth and Firestore services for use throughout your application.
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✨ 4. INITIALIZE ANALYTICS SAFELY
// This ensures Analytics is only initialized on the client-side.
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);