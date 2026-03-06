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
 * Retrieve orders. If `restaurantId` is provided (or available in localStorage)
 * uses the `/order/restaurant-orders/{restaurantId}` endpoint; otherwise
 * falls back to the generic `/orders` path.
 *
 * `statuses` may be a string (comma separated) or an array.
 * When omitted, returns all orders for the target endpoint.
 */
export async function fetchOrders(statuses, restaurantId) {
  const rid =
    restaurantId || localStorage.getItem("restaurantId") || null;
  let path;
  if (rid) {
    path = `/order/restaurant-orders/${rid}`; // corrected spelling
  } else {
    path = "/orders";
  }

  // debug: report how statuses/restaurantId resolved
  console.log("[order service] fetchOrders called", {
    inputStatuses: statuses,
    restaurantId: rid,
    computedPath: path,
    willAddStatusQuery: !!statuses,
  });

  if (statuses) {
    // backend expects all status values in uppercase
    let list;
    if (Array.isArray(statuses)) {
      list = statuses;
    } else {
      // split comma-separated string if necessary
      list = statuses.split(",");
    }
    const upper = list
      .map((s) => String(s).trim().toUpperCase())
      .filter((s) => s.length)
      .join(",");
    
    path += `?status=${encodeURIComponent(upper)}`;
  }

  const res = await api.get(path);
  // some endpoints wrap the list in `data` property, sometimes not
  return res.data?.data || res.data || [];
}

export async function createOrder(payload) {
  const res = await api.post("/order", payload);
  return res.data?.data || res.data;
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
  // convenience wrapper that passes the restaurant id automatically
  return fetchOrders("READY");
}

// convenience wrapper in case caller wants explicit restaurant-order endpoint
// this function simply delegates to `fetchOrders` and optionally accepts a
// status filter.
export async function fetchRestaurantOrders(restaurantId, statuses) {
  return fetchOrders(statuses, restaurantId);
}

export async function fetchRestaurantOrdersPaginated(
  restaurantId,
  {
    page = 1,
    limit = 10,
    statuses,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = {},
) {
  const rid = restaurantId || localStorage.getItem("restaurantId");
  if (!rid) {
    throw new Error("restaurantId is required to fetch restaurant orders");
  }

  const params = {
    page,
    limit,
    sortBy,
  };

  const normalizedSortOrder =
    String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
  params.sortOrder = normalizedSortOrder;
  params.sortorder = normalizedSortOrder;

  if (statuses) {
    const list = Array.isArray(statuses) ? statuses : String(statuses).split(",");
    const normalizedStatus = list
      .map((status) => String(status).trim().toUpperCase())
      .filter((status) => status.length)
      .join(",");

    if (normalizedStatus) {
      params.status = normalizedStatus;
    }
  }

  const res = await api.get(`/order/restaurant-orders/${rid}`, { params });
  const payload = res.data || {};

  return {
    statusCode: payload.statusCode,
    success: payload.success,
    message: payload.message,
    meta: payload.meta || {
      total: 0,
      page,
      limit,
    },
    data: payload.data || [],
  };
}

// a simpler helper when you only need to GET all orders for a restaurant
// (no status query). the request will automatically include the auth token
// and tenantid header via the shared axios instance.
export async function getRestaurantOrders(restaurantId) {
  const rid = restaurantId || localStorage.getItem("restaurantId");
  if (!rid) {
    throw new Error("restaurantId is required to fetch restaurant orders");
  }
  const res = await api.get(`/order/restaurant-orders/${rid}`);
  return res.data?.data || res.data || [];
}

// helper for sidebar logo/name fetch
export async function getRestaurant(restaurantId) {
  if (!restaurantId) return null;
  const res = await api.get(`/restaurant/${restaurantId}`);
  return res.data?.data || res.data || null;
}
