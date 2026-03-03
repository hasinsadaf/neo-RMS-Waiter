import api from "./api";

export async function getProfile() {
  const response = await api.get("/user/me");
  return response.data?.data || response.data || null;
}

export async function updateProfile(data) {
  const response = await api.patch("/user/me", data);
  return response.data;
}

export async function markAttendance() {
  const response = await api.post("/waiter/attendance/mark-today");
  return response.data;
}

// helper used by shell when no name is stored locally
export async function fetchCurrentUserName() {
  const possiblePaths = ["/auth/me", "/users/me", "/me"];
  for (const p of possiblePaths) {
    try {
      const res = await api.get(p);
      const data = res?.data?.data || res?.data || {};
      const name = data?.fullName || data?.name || data?.username;
      if (name) return name;
    } catch (err) {
      // swallow and try the next endpoint
    }
  }
  return null;
}
