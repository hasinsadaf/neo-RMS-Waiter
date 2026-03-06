import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import {
  fetchOrders,
  fetchRestaurantOrdersPaginated,
} from "@/services/order";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui-waiter/card";
import { Input } from "../../components/ui-waiter/input";
import { getDisplayOrderId } from "../../utils/orderId";

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
  "COMPLETED",
];

const SORT_BY_OPTIONS = ["createdAt", "updatedAt"];
const SORT_ORDER_OPTIONS = ["asc", "desc"];


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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const statusParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status");
  }, [location.search]);

  const selectedStatus = useMemo(() => {
    if (!statusParam) return "";
    const normalized = String(statusParam).trim().toUpperCase();
    return ORDER_STATUS_OPTIONS.includes(normalized) ? normalized : "";
  }, [statusParam]);

  const handleStatusChange = (nextStatus) => {
    const params = new URLSearchParams(location.search);

    if (nextStatus) {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }

    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: false },
    );
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const restaurantId = localStorage.getItem("restaurantId");
      console.log("[ActiveOrders] fetching paginated orders", {
        restaurantId,
        page,
        limit,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder,
      });

      if (restaurantId) {
        const response = await fetchRestaurantOrdersPaginated(restaurantId, {
          page,
          limit,
          statuses: selectedStatus || undefined,
          sortBy,
          sortOrder,
        });

        setOrders(response?.data || []);
        setTotalOrders(Number(response?.meta?.total || 0));
      } else {
        const data = await fetchOrders(selectedStatus || undefined);
        const allOrders = data || [];
        const sortedOrders = [...allOrders].sort((a, b) => {
          const aTime = new Date(a?.[sortBy] || 0).getTime();
          const bTime = new Date(b?.[sortBy] || 0).getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        });
        const startIndex = (page - 1) * limit;
        const paginatedOrders = sortedOrders.slice(startIndex, startIndex + limit);
        setOrders(paginatedOrders);
        setTotalOrders(sortedOrders.length);
      }
    } catch (err) {
      setError("Failed to load active orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, limit, sortBy, sortOrder]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    return orders.filter((order) =>
      String(order.type || order.orderType || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    );
  }, [orders, searchTerm]);

  const totalPages = useMemo(() => {
    if (!totalOrders || !limit) return 1;
    return Math.max(1, Math.ceil(totalOrders / limit));
  }, [totalOrders, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

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
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
                >
                  {SORT_BY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      Sort By: {option}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
                >
                  {SORT_ORDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
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
                    <th className="px-4 py-3">Updated At</th>
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
                            #{getDisplayOrderId(order.id)}
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
                              {formatDateTime(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-neutral-400" />
                              {formatDateTime(order.updatedAt)}
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
                            colSpan={6}
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

            {!error && !isLoading && (
              <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-neutral-600">
                  Page {page} of {totalPages} · Total orders: {totalOrders}
                </p>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="orders-per-page"
                    className="text-sm text-neutral-600"
                  >
                    Rows:
                  </label>
                  <select
                    id="orders-per-page"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={!hasPreviousPage || isLoading}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!hasNextPage || isLoading}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ActiveOrders;

