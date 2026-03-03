import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Hydrate session from localStorage on first load ──────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser  = localStorage.getItem("user");

      const tokenValid =
        storedToken &&
        storedToken !== "null" &&
        storedToken !== "undefined" &&
        storedToken.trim() !== "";

      const userValid =
        storedUser &&
        storedUser !== "null" &&
        storedUser !== "undefined";

      if (tokenValid && userValid) {
        setUser(JSON.parse(storedUser));
      } else {
        // Wipe corrupted values so they never reach the backend
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const persistSession = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await axiosInstance.post("/api/auth/login", { email, password });
    persistSession(data.token, data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await axiosInstance.post("/api/auth/register", { name, email, password });
    persistSession(data.token, data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};