// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-1babf.firebaseapp.com",
  projectId: "mern-estate-1babf",
  storageBucket: "mern-estate-1babf.firebasestorage.app",
  messagingSenderId: "201968412903",
  appId: "1:201968412903:web:34857bb46463afd4fc1a42",
  measurementId: "G-94ZKHSHQ10"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);