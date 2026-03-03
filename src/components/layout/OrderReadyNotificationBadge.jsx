import React from "react";
import { Bell } from "lucide-react";

export default function OrderReadyNotificationBadge() {
  return (
    <button
      type="button"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FF4D4F]/40 bg-white text-[#FF4D4F] shadow-sm hover:bg-[#FFF5F5] hover:text-[#FF7F7F] transition-colors"
      aria-label="Order ready notifications"
    >
      <Bell className="h-4 w-4" />
      <span className="pointer-events-none absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#FF4D4F] px-1 text-[10px] font-semibold text-white">
        3
      </span>
    </button>
  );
}

