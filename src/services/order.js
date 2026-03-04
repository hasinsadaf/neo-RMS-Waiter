import api from "./api";

// canonical status list – useful for dropdowns/validation elsewhere
export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "CANCELED",
  "DELIVERED",
];

/**
 * Fetch orders for the current restaurant.
 * Reads `restaurantId` directly from localStorage.
 * `statuses` is an optional array — when omitted, returns all statuses.
 * Sends repeated query params: ?status=PENDING&status=READY&...
 */
export async function fetchRestaurantOrders(statuses) {
  const restaurantId = localStorage.getItem("restaurantId");
  if (!restaurantId) throw new Error("No restaurantId found in localStorage");

  const params = new URLSearchParams();
  if (Array.isArray(statuses) && statuses.length > 0) {
    statuses.forEach((s) => params.append("status", s.trim().toUpperCase()));
  }

  const query = params.toString();
  const path = `/order/restaurant-orders/${restaurantId}${query ? `?${query}` : ""}`;

  const res = await api.get(path);
  return res.data?.data || res.data || [];
}

export async function createOrder(payload) {
  const res = await api.post("/order", payload);
  return res.data;
}

export async function getOrder(id) {
  const res = await api.get(`/order/${id}`);
  return res.data;
}

export async function payOrder(orderId, paymentData) {
  const res = await api.post(`/order/${orderId}/pay`, paymentData);
  return res.data;
}

export async function updateOrderStatus(orderId, status) {
  // API spec uses PUT and a slightly different path
  const res = await api.put(`/order/${orderId}/status`, { status });
  return res.data;
}

export async function fetchReadyOrders() {
  return fetchRestaurantOrders(["READY"]);
}

// helper for sidebar logo/name fetch
export async function getRestaurant(restaurantId) {
  if (!restaurantId) return null;
  const res = await api.get(`/restaurant/${restaurantId}?includeMenu=false`);
  return res.data?.data || res.data || null;
}
