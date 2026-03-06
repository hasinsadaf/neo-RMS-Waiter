import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { fetchReadyOrders } from "../../services/order";
import { useToast } from "../ui-waiter/use-toast";
import { getDisplayOrderId } from "../../utils/orderId";

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

  const loadReadyOrders = async () => {
    try {
      const orders = await fetchReadyOrders();
      setReadyOrders(normalizeOrders(orders));

      const currentIds = new Set(orders.map((o) => o.id));
      const previousIds = previousIdsRef.current;

      if (hasInitializedRef.current) {
        const newlyReady = orders.filter((o) => !previousIds.has(o.id));

        if (newlyReady.length === 1) {
          const o = newlyReady[0];
          toast({
            title: "New order ready",
            description: `Order #${getDisplayOrderId(o.id)} is ready (Table ${o.tableNumber}).`,
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
    loadReadyOrders();

    const id = setInterval(loadReadyOrders, pollIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIntervalMs]);

  const count = readyOrders.length;

  return (
    <button
      type="button"
      onClick={() => navigate("/waiter/orders?status=Ready")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FF4D4F]/40 bg-white text-[#FF4D4F] shadow-sm hover:bg-[#FFF5F5] hover:text-[#FF7F7F] transition-colors transform active:scale-95 active:opacity-80"
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

