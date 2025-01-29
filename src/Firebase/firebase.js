// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyOEewLMmEHxzfikKpOn2_ADgf7x7TSKY",
  authDomain: "fitmap-84de1.firebaseapp.com",
  projectId: "fitmap-84de1",
  storageBucket: "fitmap-84de1.firebasestorage.app",
  messagingSenderId: "1065715922957",
  appId: "1:1065715922957:web:85574ecc095f00d2d67d44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider(app);