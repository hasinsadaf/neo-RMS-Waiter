import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../ui-waiter/use-toast";

function normalizeOrders(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
}

export default function OrderNotificationBadge({ pollIntervalMs = 10000 }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [readyOrders, setReadyOrders] = useState([]);

  const previousIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);

  const fetchReadyOrders = async () => {
    try {
      const response = await api.get("/orders?status=Ready");
      const orders = normalizeOrders(response.data);

      setReadyOrders(orders);

      const currentIds = new Set(orders.map((o) => o.id));
      const previousIds = previousIdsRef.current;

      if (hasInitializedRef.current) {
        const newlyReady = orders.filter((o) => !previousIds.has(o.id));

        if (newlyReady.length === 1) {
          const o = newlyReady[0];
          toast({
            title: "New order ready",
            description: `Order #${o.id} is ready (Table ${o.tableNumber}).`,
          });
        } else if (newlyReady.length > 1) {
          toast({
            title: "New ready orders",
            description: `${newlyReady.length} orders are ready to serve.`,
          });
        }
      }

      previousIdsRef.current = currentIds;
      hasInitializedRef.current = true;
    } catch (e) {
      // Keep silent during polling failures to avoid toast spam.
    }
  };

  useEffect(() => {
    fetchReadyOrders();

    const id = setInterval(fetchReadyOrders, pollIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIntervalMs]);

  const count = readyOrders.length;

  return (
    <button
      type="button"
      onClick={() => navigate("/waiter/orders?status=Ready")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C3110C]/40 bg-white text-[#C3110C] shadow-sm hover:bg-[#FDE2D3] hover:text-[#E6501B] transition-colors"
      aria-label="Ready order notifications"
    >
      <Bell className="h-4 w-4" />

      {count > 0 && (
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

