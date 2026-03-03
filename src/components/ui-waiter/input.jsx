import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`flex h-10 w-full rounded-md border border-[#FF4D4F] bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
});

