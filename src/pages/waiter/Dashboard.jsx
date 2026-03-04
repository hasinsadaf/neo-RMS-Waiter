import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, List, CheckCircle2, Coffee, Calendar, Clock } from "lucide-react";
import { fetchRestaurantOrders } from "../../services/order";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui-waiter/card";
import { Button } from "../../components/ui-waiter/button";

function StatusPill({ label, value, tone }) {
  const tones = {
    neutral: "bg-neutral-50 text-neutral-800 border-neutral-200",
    amber: "bg-[#FFF5F5] text-[#FF4D4F] border-[#FFD9D9]",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-sky-50 text-sky-800 border-sky-200",
  };

  const base =
    "inline-flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium w-full";

  return (
    <div className={`${base} ${tones[tone] || tones.neutral}`}>
      <span className="uppercase tracking-[0.18em]">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only fetch active statuses — no need to load DELIVERED/CANCELED orders
        // for the dashboard summary.
        const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY"];
        const data = await fetchRestaurantOrders(ACTIVE_STATUSES);
        setOrders(data || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardOrders();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const confirmed = orders.filter((o) => o.status === "CONFIRMED").length;
    const preparing = orders.filter((o) => o.status === "PREPARING").length;
    const ready = orders.filter((o) => o.status === "READY").length;
    const served = orders.filter((o) => o.status === "DELIVERED").length;

    const totalAmount = orders.reduce(
      (sum, o) => sum + Number(o.totalPrice || 0),
      0
    );

    return {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      served,
      totalAmount,
    };
  }, [orders]);

  const latestOrders = useMemo(
    () => orders.slice(0, 5),
    [orders]
  );

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4D4F]/10 text-[#FF4D4F]">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Waiter Overview
              </h1>
              <p className="text-sm text-neutral-500">
                Quick snapshot of your tables and orders.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => navigate("/waiter/orders")}
            >
              <List className="mr-2 h-4 w-4" />
              Active Orders
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => navigate("/waiter/create-order")}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <button
            type="button"
            onClick={() => navigate("/waiter/orders")}
            className="text-left transition-all hover:shadow-md active:scale-95"
          >
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Active Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-neutral-900">
                  {stats.total}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  All pending, preparing, ready and served.
                </p>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => navigate("/waiter/orders")}
            className="text-left transition-all hover:shadow-md active:scale-95"
          >
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Ready to Serve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-neutral-900">
                  {stats.ready}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Orders marked as ready.
                </p>
              </CardContent>
            </Card>
          </button>

          <button
            type="button"
            onClick={() => navigate("/waiter/orders")}
            className="text-left transition-all hover:shadow-md active:scale-95"
          >
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-neutral-900">
                  {stats.pending + stats.preparing}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Pending and preparing orders.
                </p>
              </CardContent>
            </Card>
          </button>

          <button className="text-left transition-all hover:shadow-md active:scale-95">
          <Card className="border border-neutral-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-neutral-900">
                {stats.totalAmount.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Total of listed orders.
              </p>
            </CardContent>
          </Card>
          </button>
        </div>

        {/* Status breakdown + latest orders */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Card className="border border-neutral-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900">
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <StatusPill
                label="Pending"
                value={stats.pending}
                tone="yellow"
              />
              <StatusPill
                label="Confirmed"
                value={stats.confirmed}
                tone="neutral"
              />
              <StatusPill
                label="Preparing"
                value={stats.preparing}
                tone="neutral"
              />
              <StatusPill label="Ready" value={stats.ready} tone="neutral" />
              <StatusPill label="Served" value={stats.served} tone="neutral" />
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900">
                Latest Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 animate-pulse"
                    >
                      <div className="h-3 w-24 rounded bg-neutral-300" />
                      <div className="h-3 w-16 rounded bg-neutral-300" />
                      <div className="h-3 w-20 rounded bg-neutral-300" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : latestOrders.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No orders yet. Start by creating a new order.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {latestOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => navigate(`/waiter/orders/${order.id}`)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-[#FFF5F5] transition-transform transform active:scale-95 active:opacity-80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-neutral-900">
                          Order #{order.id}
                        </p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {Number(order.totalPrice || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Table {order.tableNumber} · {order.status || "Unknown"}</span>
                        {order.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      {order.status === "READY" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

