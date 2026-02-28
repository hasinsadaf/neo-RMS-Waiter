import React, { createContext, useContext, useState } from "react";

const SheetContext = createContext(null);

export function Sheet({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild, children, ...props }) {
  const ctx = useContext(SheetContext);
  if (!ctx) return children;

  const handleClick = (e) => {
    ctx.setOpen(true);
    if (typeof props.onClick === "function") props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({ side = "left", className = "", children }) {
  const ctx = useContext(SheetContext);
  if (!ctx || !ctx.open) return null;

  const sideClasses =
    side === "right"
      ? "right-0 translate-x-0"
      : "left-0 translate-x-0";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={`relative h-full w-64 bg-white shadow-xl border-r border-neutral-200 p-4 ${sideClasses} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props} />
  );
}

export function SheetTitle({ className = "", ...props }) {
  return (
    <h2
      className={`text-lg font-semibold text-neutral-900 ${className}`}
      {...props}
    />
  );
}

export function SheetClose({ asChild, children, ...props }) {
  const ctx = useContext(SheetContext);
  if (!ctx) return children;

  const handleClick = (e) => {
    ctx.setOpen(false);
    if (typeof props.onClick === "function") props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

