import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhehWVa61xPgxvJ9bJflNsxaRgBjI1BVI",
  authDomain: "pet-store-web-project.firebaseapp.com",
  projectId: "pet-store-web-project",
  storageBucket: "pet-store-web-project.firebasestorage.app",
  messagingSenderId: "324935643446",
  appId: "1:324935643446:web:0cb68db9c1a1c55a958397",
  measurementId: "G-1KH0QBQYQ4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
