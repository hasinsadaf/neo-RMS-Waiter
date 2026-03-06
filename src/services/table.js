import api from "./api";

export async function fetchTablesByRestaurant(restaurantId) {
  if (!restaurantId) return [];

  const res = await api.get(`/table/${restaurantId}`);
  const payload = res?.data;

  if (Array.isArray(payload)) return payload;

  return payload?.data || payload?.tables || payload?.items || [];
}
