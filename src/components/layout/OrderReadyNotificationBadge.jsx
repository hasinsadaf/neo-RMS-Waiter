import React from "react";
import { Bell } from "lucide-react";

export default function OrderReadyNotificationBadge() {
  return (
    <button
      type="button"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#C3110C]/40 bg-white text-[#C3110C] shadow-sm hover:bg-[#FDE2D3] hover:text-[#E6501B] transition-colors"
      aria-label="Order ready notifications"
    >
      <Bell className="h-4 w-4" />
      <span className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#C3110C] px-1 text-[10px] font-semibold text-white">
        3
      </span>
    </button>
  );
}

