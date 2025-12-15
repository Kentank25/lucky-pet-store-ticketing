import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBhehWVa61xPgxvJ9bJflNsxaRgBjI1BVI",
  authDomain: "pet-store-web-project.firebaseapp.com",
  projectId: "pet-store-web-project",
  storageBucket: "pet-store-web-project.firebasestorage.app",
  messagingSenderId: "324935643446",
  appId: "1:324935643446:web:0cb68db9c1a1c55a958397",
  measurementId: "G-1KH0QBQYQ4",
};


export const registerUser = async (email, password, name, role) => {
  let secondaryApp = null;
  try {

    const appName = "secondaryApp";
    secondaryApp = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    await signOut(secondaryAuth);

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;

  }
};

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (uid, data) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

export const deleteUser = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
};
