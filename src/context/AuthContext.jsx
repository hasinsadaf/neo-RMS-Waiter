import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { getRestaurant } from "../services/order";

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

function loadCachedUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserToCache(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [tenantId, setTenantId] = useState(() =>
    localStorage.getItem("tenantId"),
  );
  // Hydrate user from localStorage immediately — no loading flicker on refresh
  const [user, setUser] = useState(() => loadCachedUser());

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("restaurantData");
    saveUserToCache(null);
    setToken(null);
    setTenantId(null);
    setUser(null);
  }, []);

  // On mount, silently revalidate the token and refresh user data in the background.
  // The cached user is already set above, so the UI renders instantly.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    api
      .get("/user/me")
      .then((res) => {
        if (cancelled) return;
        const parsed = parseUser(res.data?.data);
        if (parsed?.tenantId) {
          localStorage.setItem("tenantId", parsed.tenantId);
          setTenantId(parsed.tenantId);
        }
        saveUserToCache(parsed);
        setUser(parsed);
      })
      .catch(() => {
        // Token is invalid/expired — force logout
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (accessToken, fallbackUserData) => {
    localStorage.setItem("authToken", accessToken);
    setToken(accessToken);

    let parsed;
    try {
      const res = await api.get("/user/me");
      parsed = parseUser(res.data?.data);
    } catch {
      // fallback: use data already returned from the login response
      parsed = parseUser(fallbackUserData);
    }

    if (parsed?.tenantId) {
      localStorage.setItem("tenantId", parsed.tenantId);
      setTenantId(parsed.tenantId);
    }
    if (parsed?.restaurantId) {
      localStorage.setItem("restaurantId", parsed.restaurantId);
    }
    saveUserToCache(parsed);
    setUser(parsed);

    // Fetch and cache restaurant data immediately after login so sidebar/footer
    // never need to make this request themselves.
    if (parsed?.restaurantId) {
      try {
        const restaurantData = await getRestaurant(parsed.restaurantId);
        if (restaurantData) {
          localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
        }
      } catch {
        // non-critical — sidebar will handle missing cache gracefully
      }
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
