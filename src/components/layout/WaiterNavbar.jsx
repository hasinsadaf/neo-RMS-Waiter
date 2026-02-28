import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  List,
  CreditCard,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "../ui-waiter/button.jsx";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "../ui-waiter/sheet.jsx";
import OrderNotificationBadge from "../waiter/OrderNotificationBadge.jsx";

const navItems = [
  {
    label: "Dashboard",
    to: "/waiter/dashboard",
    icon: Home,
  },
  {
    label: "Create Order",
    to: "/waiter/create-order",
    icon: PlusCircle,
  },
  {
    label: "Active Orders",
    to: "/waiter/orders",
    icon: List,
  },
  {
    label: "Billing",
    to: "/waiter/orders?status=Ready",
    icon: CreditCard,
  },
];

function WaiterNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("Restaurant Management");

  const waiterName = useMemo(() => localStorage.getItem("waiterName") || localStorage.getItem("userName") || "Waiter", []);
  const avatarLetter = waiterName.charAt(0).toUpperCase();

  // Fetch restaurant logo and settings via api (uses axios instance which includes auth token)
  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      try {
        const res = await import("@/services/api").then((m) => m.default.get("/restaurant/settings"));
        const data = res?.data?.data || res?.data || {};
        if (!mounted) return;
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
        const nameFromApi = data?.name || data?.restaurantName || data?.title;
        if (nameFromApi && typeof nameFromApi === "string") setRestaurantName(nameFromApi);
      } catch {
        if (mounted) setRestaurantName("Restaurant Management");
      } finally {
        if (mounted) setLogoLoading(false);
      }
    };
    fetchLogo();
    return () => {
      mounted = false;
    };
  }, []);

  const isNavItemActive = (to) => {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);
    const status = params.get("status");

    if (to === "/waiter/orders") {
      return pathname === "/waiter/orders" && status !== "Ready";
    }

    if (to === "/waiter/orders?status=Ready") {
      return (
        (pathname === "/waiter/orders" && status === "Ready") ||
        pathname.startsWith("/waiter/billing")
      );
    }

    return pathname === to;
  };

  const handleLogoClick = () => {
    navigate("/waiter/dashboard");
  };

  const handleLogout = () => {
    // clear auth storage keys used across the app
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("waiterName");
    navigate("/waiter/login", { replace: true });
    // force full reload to reset in-memory axios state if any
    window.location.reload();
  };

  const navLinkClasses = (to) => {
    const isActive = isNavItemActive(to);
    return [
      "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-[#C3110C] text-white"
        : "text-neutral-500 hover:bg-[#FDE2D3] hover:text-neutral-900",
    ].join(" ");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white shadow-md border-b border-[#C3110C]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">

        {/* Left: Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-left"
        >
          {/* Logo ring */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#C3110C] bg-white shadow-sm overflow-hidden">
            {logoLoading ? (
              // Skeleton pulse while fetching
              <div className="h-full w-full animate-pulse bg-neutral-100 rounded-full" />
            ) : logoUrl ? (
              // Fetched logo image fitted inside the ring
              <img
                src={logoUrl}
                alt="Restaurant Logo"
                className="h-full w-full object-cover rounded-full"
                onError={() => setLogoUrl(null)} // fallback if image URL is broken
              />
            ) : (
              // Fallback: neoRMS styled text badge
              <span className="text-[9px] font-extrabold tracking-tight text-[#C3110C] leading-none select-none text-center">
                neo
                <br />
                RMS
              </span>
            )}
          </div>

          {/* Text label */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">
              {restaurantName}
            </span>
            <span className="text-xs font-medium text-white">
              Waiter Panel
            </span>
          </div>
        </button>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClasses(item.to)}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-white" : ""}`}
                />
                <span className={isActive ? "text-white" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          <OrderNotificationBadge />

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 shadow-sm hover:bg-[#FDE2D3] hover:text-neutral-900 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C3110C] text-xs font-semibold text-white">
                {avatarLetter}
              </div>
              <span className="hidden sm:inline-block max-w-[120px] truncate">
                {waiterName}
              </span>
              <User className="h-4 w-4 text-neutral-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-[#FDE2D3]"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/waiter/profile");
                  }}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-[#FDE2D3]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-neutral-200 bg-white text-neutral-700 hover:bg-[#FDE2D3]"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r border-neutral-200">
                <SheetHeader>
                  <SheetTitle>Waiter Navigation</SheetTitle>
                </SheetHeader>

                <div className="mt-2 flex flex-col gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(item.to);
                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className={[
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#C3110C] text-white"
                              : "text-neutral-600 hover:bg-[#FDE2D3] hover:text-neutral-900",
                          ].join(" ")}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "text-white" : ""
                            }`}
                          />
                          <span className={isActive ? "text-white" : ""}>
                            {item.label}
                          </span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default WaiterNavbar;