import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
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
          setRole(null);
          setUser(currentUser);
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
      toast.success("Berhasil logout", { id: toastId });
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Gagal logout", { id: toastId });
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
