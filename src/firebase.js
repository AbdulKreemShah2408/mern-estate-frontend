// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-5585a.firebaseapp.com",
  projectId: "mern-estate-5585a",
  storageBucket: "mern-estate-5585a.firebasestorage.app",
  messagingSenderId: "930329421751",
  appId: "1:930329421751:web:41d377ab9625a41a56aa32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
