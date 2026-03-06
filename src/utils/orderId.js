export function getDisplayOrderId(orderId) {
  if (orderId === null || orderId === undefined) return "";

  const normalizedOrderId = String(orderId);
  const [firstSegment] = normalizedOrderId.split("-");

  return firstSegment || normalizedOrderId;
}
