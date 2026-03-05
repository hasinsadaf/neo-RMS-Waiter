export const BACKEND_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const WaiterSocketEventEnum = Object.freeze({
  // once user is ready to go
  CONNECTED_EVENT: "connected",

  // when user gets disconnected
  DISCONNECT_EVENT: "disconnect",

  // when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",

  // when user places an order
  ORDER_PLACED_EVENT: "orderPlaced",

  // when an order is confirmed
  ORDER_CONFIRMATION_EVENT: "orderConfirmation",

  // when user cancels an order
  ORDER_CANCELLED_EVENT: "orderCancelled",

  // when order is ready
  ORDER_READY_EVENT: "orderReady",

  // when order is delivered
  ORDER_DELIVERED_EVENT: "orderDelivered",

  // legacy aliases kept to avoid breaking older code paths
  ORDER_UPDATED_EVENT: "orderUpdated",

  // when order is cancelled by chef
  ORDER_CANCELLED_BY_CHEF_EVENT: "orderCancelledByChef",
});
