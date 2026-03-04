import React, { useEffect, useState } from "react";
import { fetchOrders } from "../../services/order"; // adjust path if needed

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeliveredOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchOrders();

      // ✅ Handle both array and wrapped API response
      const allOrders = Array.isArray(response)
        ? response
        : response?.data || [];

      // ✅ Filter only DELIVERED (case-safe)
      const deliveredOrders = allOrders.filter(
        (order) => order.status?.toUpperCase() === "DELIVERED"
      );

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