import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const RoleContext = createContext();

const CREDENTIALS = {
  admin: { password: "adminPass123", role: "admin", name: "Administrator" },
  pic_grooming: {
    password: "picGroomingPass123",
    role: "pic_grooming",
    name: "PIC Grooming",
  },
  pic_klinik: {
    password: "picKlinikPass123",
    role: "pic_klinik",
    name: "PIC Klinik",
  },
  kiosk: { password: "kioskPass123", role: "kiosk", name: "Kiosk Machine" },
};

export const RoleProvider = ({ children }) => {
  // Initialize role from localStorage if available to persist login
  const [role, setRole] = useState(
    () => localStorage.getItem("user_role") || null
  );
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem("user_role");
    return savedRole
      ? CREDENTIALS[
          Object.keys(CREDENTIALS).find(
            (k) => CREDENTIALS[k].role === savedRole
          )
        ]
      : null;
  });

  const login = (username, password) => {
    const userCred = CREDENTIALS[username];
    if (userCred && userCred.password === password) {
      setRole(userCred.role);
      setUser(userCred);
      localStorage.setItem("user_role", userCred.role);
      toast.success(`Selamat datang, ${userCred.name}!`);
      return true;
    }
    toast.error("Username atau password salah!");
    return false;
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem("user_role");
    toast.success("Berhasil logout");
  };

  return (
    <RoleContext.Provider value={{ role, user, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
