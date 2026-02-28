import React from "react";

export function Label({ className = "", ...props }) {
  return (
    <label
      className={`text-sm font-medium leading-none text-neutral-200 ${className}`}
      {...props}
    />
  );
}

