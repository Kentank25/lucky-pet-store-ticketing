import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth Listener
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            setUser({ ...currentUser, ...userData });
          } else {
            console.warn(
              "User login berhasil tapi data role tidak ditemukan di Firestore."
            );
            setRole(null);
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Gagal mengambil data user:", error);
          toast.error("Gagal memuat data profil.");
        }
      } else {
        setRole(null);
        setUser(null);
      }
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email, password) => {
    const toastId = toast.loading("Sedang masuk...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State 'role' & 'user' will be updated by onAuthStateChanged listener
      toast.success("Berhasil login!", { id: toastId });
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      let msg = "Gagal login.";
      if (error.code === "auth/invalid-credential")
        msg = "Email atau password salah.";
      if (error.code === "auth/user-not-found") msg = "Akun tidak ditemukan.";
      toast.error(msg, { id: toastId });
      return false;
    }
  };

  const logout = async () => {
    const toastId = toast.loading("Keluar...");
    try {
      await signOut(auth);
      // State cleared by listener
      toast.success("Berhasil logout", { id: toastId });
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Gagal logout", { id: toastId });
    }
  };

  return (
    <RoleContext.Provider value={{ role, user, loading, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
