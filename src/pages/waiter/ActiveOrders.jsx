import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, Clock } from "lucide-react";
import { fetchOrders, fetchRestaurantOrders } from "@/services/order";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui-waiter/card";
import { Input } from "../../components/ui-waiter/input";


function StatusBadge({ status }) {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

  const variants = {
    Pending:
      "bg-neutral-100 text-neutral-700 border border-neutral-200",
    Preparing:
      "bg-yellow-50 text-yellow-800 border border-yellow-200",
    Ready: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    Served: "bg-blue-50 text-blue-700 border border-blue-200",
    default:
      "bg-neutral-100 text-neutral-700 border border-neutral-200",
  };

  const classes = variants[status] || variants.default;

  return (
    <span className={`${baseClasses} ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current/70 mr-1.5" />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-16 rounded bg-neutral-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-10 rounded bg-neutral-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 rounded bg-neutral-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 rounded bg-neutral-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-24 rounded-full bg-neutral-200" />
      </td>
    </tr>
  );
}

function ActiveOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const statusParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status");
  }, [location.search]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const restaurantId = localStorage.getItem("restaurantId");
      console.log("[ActiveOrders] fetching all orders, restaurantId", restaurantId);
      const data = restaurantId
        ? await fetchRestaurantOrders(restaurantId)
        : await fetchOrders();
      setOrders(data || []);
    } catch (err) {
      setError("Failed to load active orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    return orders.filter((order) =>
      String(order.type || order.orderType || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    );
  }, [orders, searchTerm]);

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl">
        <Card className="rounded-xl border border-neutral-200 bg-white shadow-xl">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
                Active Orders
              </CardTitle>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Search by order type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F] md:w-64"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <SkeletonRow key={idx} />
                      ))
                    : filteredOrders.length > 0
                    ? filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-neutral-100 hover:bg-neutral-50/60 cursor-pointer"
                          onClick={() => navigate(`/waiter/orders/${order.id}`)}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {order.type || order.orderType || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-900">
                            {Number(order.totalPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-neutral-400" />
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))
                    : !error && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-neutral-500"
                          >
                            No active orders found.
                          </td>
                        </tr>
                      )}
                </tbody>
              </table>
            </div>

            {error && !isLoading && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ActiveOrders;

