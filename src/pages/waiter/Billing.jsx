import React, { useEffect, useState } from "react";
import { fetchOrders, fetchRestaurantOrders } from "../../services/order"; // adjust path if needed

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeliveredOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const restaurantId = localStorage.getItem("restaurantId");
      console.log("[Billing] Restaurant ID:", restaurantId);

      // First, let's fetch ALL orders to see what statuses exist
      console.log("[Billing] Fetching ALL orders to debug...");
      const allOrdersResponse = restaurantId
        ? await fetchRestaurantOrders(restaurantId)
        : await fetchOrders();

      const allOrders = Array.isArray(allOrdersResponse)
        ? allOrdersResponse
        : allOrdersResponse?.data || [];

      console.log("[Billing] ALL orders:", allOrders);
      console.log("[Billing] Available statuses:", [...new Set(allOrders.map(order => order.status))]);
      console.log("[Billing] Orders by status:", allOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}));

      // Now try fetching with DELIVERED filter
      console.log("[Billing] Now fetching DELIVERED orders...");
      const response = restaurantId
        ? await fetchRestaurantOrders(restaurantId, "DELIVERED")
        : await fetchOrders("DELIVERED");

      console.log("[Billing] DELIVERED API Response:", response);
      console.log("[Billing] Response type:", typeof response, Array.isArray(response));

      // ✅ Handle both array and wrapped API response
      const deliveredOrders = Array.isArray(response)
        ? response
        : response?.data || [];

      console.log("[Billing] Filtered delivered orders:", deliveredOrders);

      setOrders(deliveredOrders);
    } catch (err) {
      console.error("[Billing] fetch orders error:", err);
      setError("Failed to load delivered orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Billing - Delivered Orders</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <p>No delivered orders found.</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <table border="1" cellPadding="10" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName || "N/A"}</td>
                <td>{order.totalAmount}</td>
                <td>{order.status}</td>
                <td>{order.paymentStatus}</td>
                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Billing;