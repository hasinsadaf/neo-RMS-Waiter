import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`flex h-10 w-full rounded-md border border-[#C3110C] bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-[#C3110C] focus-visible:border-[#C3110C] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
});

