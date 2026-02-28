import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import api from "../../services/api";
import { Button } from "../ui-waiter/button";
import { useToast } from "../ui-waiter/use-toast";

const STATUS_OPTIONS = ["Pending", "Preparing", "Ready", "Served"];

function OrderStatusControls({ orderId, currentStatus, onStatusUpdated }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus || "Pending");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setStatus(currentStatus || "Pending");
  }, [currentStatus]);

  const handleUpdateStatus = async () => {
    if (!orderId || isUpdating) return;

    if (!status) {
      toast({
        title: "Select a status",
        description: "Please choose a status before updating.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);

      await api.patch(`/orders/${orderId}/status`, {
        status,
      });

      toast({
        title: "Status Updated",
        description: `Order status changed to "${status}".`,
      });

      if (typeof onStatusUpdated === "function") {
        onStatusUpdated(status);
      }
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs font-medium text-neutral-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C3110C] focus-visible:border-[#C3110C]"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={isUpdating}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 rounded-full border-neutral-300 text-neutral-800 hover:border-[#C3110C] hover:text-white hover:bg-[#C3110C]"
        onClick={handleUpdateStatus}
        disabled={isUpdating || !orderId}
      >
        <RefreshCcw className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">
          {isUpdating ? "Updating..." : "Update"}
        </span>
      </Button>
    </div>
  );
}

export default OrderStatusControls;

