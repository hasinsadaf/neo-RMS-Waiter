import React from "react";

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C3110C] disabled:pointer-events-none disabled:opacity-60";

const variantClasses = {
  default: "bg-[#C3110C] text-white hover:bg-[#E6501B]",
  outline:
    "border border-[#C3110C] bg-white text-[#C3110C] hover:bg-[#FDE2D3]",
  ghost:
    "bg-transparent text-[#C3110C] hover:bg-[#FDE2D3]",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(function Button(
  { className = "", variant = "default", size = "default", ...props },
  ref
) {
  const variantClass = variantClasses[variant] || variantClasses.default;
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    />
  );
});

