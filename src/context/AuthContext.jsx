import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

function parseUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.fullName,
    role: raw.role,
    tenantId: raw.Waiter?.tenantId ?? null,
    restaurantId: raw.Waiter?.restaurantId ?? null,
    restaurantName: raw.Waiter?.restaurant?.name ?? null,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [tenantId, setTenantId] = useState(() =>
    localStorage.getItem("tenantId"),
  );
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("tenantId");
    setToken(null);
    setTenantId(null);
    setUser(null);
  }, []);

  // On mount, if a token already exists (page refresh), fetch the current user
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api
      .get("/user/getme")
      .then((res) => {
        if (cancelled) return;
        const parsed = parseUser(res.data?.data);
        if (parsed?.tenantId) {
          localStorage.setItem("tenantId", parsed.tenantId);
          setTenantId(parsed.tenantId);
        }
        setUser(parsed);
      })
      .catch(() => {
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (accessToken, fallbackUserData) => {
    localStorage.setItem("authToken", accessToken);
    setToken(accessToken);

    try {
      const res = await api.get("/user/me");
      const parsed = parseUser(res.data?.data);
      if (parsed?.tenantId) {
        localStorage.setItem("tenantId", parsed.tenantId);
        setTenantId(parsed.tenantId);
      }
      setUser(parsed);
    } catch {
      // fallback: use data already returned from the login response
      const parsed = parseUser(fallbackUserData);
      if (parsed?.tenantId) {
        localStorage.setItem("tenantId", parsed.tenantId);
        setTenantId(parsed.tenantId);
      }
      setUser(parsed);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, tenantId, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
