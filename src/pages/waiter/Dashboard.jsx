import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, List, CheckCircle2, Coffee } from "lucide-react";
import api from "../../services/api";

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
    amber: "bg-[#FDE2D3] text-[#C3110C] border-[#FAD2BF]",
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

        const response = await api.get(
          "/orders?status=Pending,Preparing,Ready,Served"
        );
        setOrders(response.data || []);
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
    const pending = orders.filter((o) => o.status === "Pending").length;
    const preparing = orders.filter((o) => o.status === "Preparing").length;
    const ready = orders.filter((o) => o.status === "Ready").length;
    const served = orders.filter((o) => o.status === "Served").length;

    const totalAmount = orders.reduce(
      (sum, o) => sum + Number(o.total || 0),
      0
    );

    return {
      total,
      pending,
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
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#C3110C]/10 text-[#C3110C]">
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
                Pending, preparing, ready and served.
              </p>
            </CardContent>
          </Card>

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
                tone="neutral"
              />
              <StatusPill
                label="Preparing"
                value={stats.preparing}
                tone="amber"
              />
              <StatusPill label="Ready" value={stats.ready} tone="green" />
              <StatusPill label="Served" value={stats.served} tone="blue" />
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
                      onClick={() => navigate(`/waiter/billing/${order.id}`)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-neutral-50"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Table {order.tableNumber} ·{" "}
                          {order.status || "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">
                          {Number(order.total || 0).toFixed(2)}
                        </p>
                        {order.status === "Ready" && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </span>
                        )}
                      </div>
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

