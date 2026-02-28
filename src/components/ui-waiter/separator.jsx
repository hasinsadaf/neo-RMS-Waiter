import React from "react";

export function Separator({ className = "", orientation = "horizontal" }) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={`shrink-0 bg-neutral-800 ${
        isHorizontal ? "h-px w-full" : "h-full w-px"
      } ${className}`}
    />
  );
}

