import React from 'react';

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', type = 'button', ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors transform active:scale-95 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md px-4 py-2';

  const variants = {
    default: 'bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] text-white hover:from-[#FF7F7F] hover:to-[#FFB3B3]',
    outline:
      'border border-[#FF4D4F] bg-white text-[#FF4D4F] hover:bg-[#FFF5F5]',
    ghost: 'bg-transparent text-[#FF4D4F] hover:bg-[#FFF5F5]',
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variantClasses} ${className}`}
      {...props}
    />
  );
});

