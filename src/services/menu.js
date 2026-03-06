import api from "./api";

export async function fetchRestaurantMenu(restaurantId) {
  if (!restaurantId) return [];

  const res = await api.get(`/menuProduct/${restaurantId}`);
  const payload = res?.data;

  if (Array.isArray(payload)) return payload;

  return (
    payload?.data ||
    payload?.items ||
    payload?.menu ||
    payload?.menuProducts ||
    []
  );
}
