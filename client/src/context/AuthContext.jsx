import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fintrack:token");
    let active = true;
    Promise.resolve().then(() => token ? api.get("/auth/me") : null)
      .then(({ data } = {}) => { if (active && data) setUser(data.user); })
      .catch(() => {
        localStorage.removeItem("fintrack:token");
        if (active) setUser(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const authenticate = useCallback(async (path, credentials) => {
    const { data } = await api.post(path, credentials);
    localStorage.setItem("fintrack:token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback((credentials) => authenticate("/auth/login", credentials), [authenticate]);
  const register = useCallback((details) => authenticate("/auth/register", details), [authenticate]);
  const logout = useCallback(() => {
    localStorage.removeItem("fintrack:token");
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
