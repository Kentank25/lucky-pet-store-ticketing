import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// Re-use config (or import it if exported, but hardcoding for safety/isolation here)
const firebaseConfig = {
  apiKey: "AIzaSyBhehWVa61xPgxvJ9bJflNsxaRgBjI1BVI",
  authDomain: "pet-store-web-project.firebaseapp.com",
  projectId: "pet-store-web-project",
  storageBucket: "pet-store-web-project.firebasestorage.app",
  messagingSenderId: "324935643446",
  appId: "1:324935643446:web:0cb68db9c1a1c55a958397",
  measurementId: "G-1KH0QBQYQ4",
};

/**
 * Register a new user with a specific role.
 * Uses a secondary app instance to prevent logging out the current admin.
 */
export const registerUser = async (email, password, name, role) => {
  let secondaryApp = null;
  try {
    // 1. Initialize a secondary app instance
    const appName = "secondaryApp";
    secondaryApp = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    // 2. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    // 3. Store user details in Firestore 'users' collection
    // Use the MAIN app's db instance for data consistency
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    // 4. Sign out the secondary user immediately to avoid any session leaks
    await signOut(secondaryAuth);

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  } finally {
    // Cleanup: delete the secondary app instance
    if (secondaryApp) {
      // Note: deleteApp is redundant if we re-use the same named app, 
      // but good for cleaning up resources if we don't need it.
      // However, keeping it might be more performant if frequent.
      // For now, let's keep it simple and not delete to avoid complexity with async cleanup
      // actually, deleteApp is safer to avoid existing app errors on hot reload
      // await deleteApp(secondaryApp).catch(console.error); 
    }
  }
};

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteUser = async (uid) => {
  // NOTE: This only deletes the record from Firestore.
  // Deleting from Auth requires Firebase Admin SDK (Backend) or re-authentication.
  // For client-side only app, we'll just remove the access record.
  await deleteDoc(doc(db, "users", uid));
};
