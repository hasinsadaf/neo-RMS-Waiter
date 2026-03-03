import api from "./api";

/**
 * Retrieve orders. `statuses` may be a string (comma separated) or an array.
 * If omitted, returns all orders.
 */
export async function fetchOrders(statuses) {
  let path = "/orders";
  if (statuses) {
    const query = Array.isArray(statuses)
      ? statuses.join(",")
      : statuses;
    path += `?status=${encodeURIComponent(query)}`;
  }
  const res = await api.get(path);
  // some endpoints wrap the list in `data` property, sometimes not
  return res.data?.data || res.data || [];
}

export async function createOrder(payload) {
  const res = await api.post("/orders", payload);
  return res.data;
}

export async function getOrder(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function payOrder(orderId, paymentData) {
  const res = await api.post(`/orders/${orderId}/pay`, paymentData);
  return res.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
}

export async function fetchReadyOrders() {
  return fetchOrders("Ready");
}

// helper for sidebar logo/name fetch
export async function getRestaurant(restaurantId) {
  if (!restaurantId) return null;
  const res = await api.get(`/restaurant/${restaurantId}`);
  return res.data?.data || res.data || null;
}
