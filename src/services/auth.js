import api from "./api";

export async function loginWaiter(email, password) {
  const res = await api.post("/auth/login/waiter", { email, password });
  return res.data;
}

export async function getCurrentUserProfile(token) {
  const res = await api.get("/user/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

// optional: wrap logout logic if needed by services layer
export function logout() {
  // this is purely client-side for now
  localStorage.removeItem("authToken");
  localStorage.removeItem("authRole");
  localStorage.removeItem("tenantId");
  localStorage.removeItem("restaurantId");
  localStorage.removeItem("waiterId");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  localStorage.removeItem("waiterName");
}
