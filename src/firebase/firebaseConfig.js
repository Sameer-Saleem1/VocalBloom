// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "@firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpNQ_WRTwPTZe_4e0Iuh6mCXpwB-6MixI",
  authDomain: "vocal-bloom.firebaseapp.com",
  projectId: "vocal-bloom",
  storageBucket: "vocal-bloom.firebasestorage.app",
  messagingSenderId: "885207749901",
  appId: "1:885207749901:web:fdb68be604803cfb1dcc44",
  measurementId: "G-7N4TJ8K4PM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db };
export { auth };
export default app;
