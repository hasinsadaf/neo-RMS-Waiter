import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  List,
  CreditCard,
  Menu,
  User,
  LogOut,
  Calendar,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
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
import { getRestaurant } from "../../services/order";

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

function WaiterSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("Restaurant Management");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const waiterName =
    user?.fullName || user?.name || user?.username ||
    localStorage.getItem("waiterName") || localStorage.getItem("userName") ||
    "Waiter";
  const avatarLetter = waiterName.charAt(0).toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchLogo = async () => {
      try {
        const restaurantId = localStorage.getItem("restaurantId");
        if (!restaurantId) {
          if (mounted) setRestaurantName("Restaurant Management");
          return;
        }

        const data = await getRestaurant(restaurantId);
        if (!mounted) return;
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
        const nameFromApi =
          data?.name || data?.restaurantName || data?.title;
        if (nameFromApi && typeof nameFromApi === "string")
          setRestaurantName(nameFromApi);
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

  const handleLogout = () => {
    logout();
    navigate("/waiter/login", { replace: true });
  };

  // FIX 1: "group" is now inside linkClasses so it's always on the same element.
  // "text-white" on the link makes BOTH the text and icon inherit white when inactive.
  // "hover:text-[#FF4D4F]" on the link makes BOTH text and icon turn red on hover.
  const linkClasses = (isActive) => {
    return [
      "group flex items-center gap-3 px-4 py-2 transition-colors",
      isActive
        ? "bg-white text-[#FF4D4F]"
        : "text-white hover:bg-[#FFF5F5] hover:text-[#FF4D4F]",
    ].join(" ");
  };

  return (
    <>
      {/* desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-[#FF4D4F] text-white">
        <div className="h-32 flex flex-col items-center justify-center border-b border-[#FF7F7F]/40 px-4 text-center">
          {logoLoading ? (
            <div className="h-8 w-8 animate-pulse bg-white rounded-full" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 object-cover rounded-full mb-2"
              onError={() => setLogoUrl(null)}
            />
          ) : (
            <div className="mb-2" />
          )}
          <div className="text-center">
            <p className="text-lg font-serif italic text-white leading-tight tracking-wide">
              {restaurantName}
            </p>
            <p className="text-xs text-white/80 mt-1">
              Waiter Panel
            </p>
            {/* off-white underline under header */}
            <div className="w-full h-px bg-[#FFF5F5] mt-2" />
          </div>
        </div>

        {/* Date and Time Display */}
        <div className="px-4 py-3 border-b border-[#FF7F7F]/40 bg-[#FF6B6B] space-y-2">
          <div className="flex items-center gap-2 text-white/90">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">
              {currentDateTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">
              {currentDateTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
        <nav className="flex-1 flex flex-col mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item.to);
            return (
              // FIX 2: Removed the extra "group" from here — it's now inside linkClasses.
              // The Icon no longer needs explicit color classes; it inherits from the Link's text color.
              <Link key={item.to} to={item.to} className={linkClasses(active)}>
                <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  active
                    ? "text-[#FF4D4F]"
                    : "text-white group-hover:text-[#FF4D4F]"
                }`} 
              />
                <span className={
                  active
                    ? "text-[#FF4D4F]"
                    : "text-white group-hover:text-[#FF4D4F]"
                }>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#FF7F7F]/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-[#FF4D4F] font-semibold">
              {avatarLetter}
            </div>
            <span className="truncate text-sm">{waiterName}</span>
          </div>
          <button
            onClick={() => navigate("/waiter/profile")}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] text-white transform active:scale-95 active:opacity-80"
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] text-white transform active:scale-95 active:opacity-80 mt-2"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* mobile menu trigger + sheet */}
      <div className="md:hidden fixed top-2 left-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-neutral-200 bg-white text-neutral-700 hover:bg-[#FFF5F5]"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-r border-neutral-200">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-2 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item.to);
                return (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className={
                        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                        (active
                          ? "bg-[#FF4D4F] text-white"
                          : "text-white hover:bg-[#FFF5F5] hover:text-[#FF4D4F]")
                      }
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-white group-hover:text-[#FF4D4F]" />
                      <span className="text-white group-hover:text-[#FF4D4F]">{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default WaiterSidebar;