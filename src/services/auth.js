import api from "./api";

export async function loginWaiter(email, password) {
  const res = await api.post("/auth/login/waiter", { email, password });
  return res.data;
}
