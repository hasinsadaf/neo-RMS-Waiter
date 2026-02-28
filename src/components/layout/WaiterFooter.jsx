import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useToast } from "../ui-waiter/use-toast";
// Using the same restaurant settings API as the navbar logo

function WaiterFooter() {
  const { toast } = useToast();
  const [role, setRole] = useState("guest");
  const [restaurantName, setRestaurantName] = useState("Restaurant Management");
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("role");
      if (storedRole) {
        setRole(storedRole.toLowerCase());
      }
    } catch {
      setRole("guest");
    }
  }, []);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/restaurant/settings", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();

        if (data?.logoUrl) {
          setLogoUrl(data.logoUrl);
        }

        const nameFromApi =
          data?.name || data?.restaurantName || data?.title;
        if (nameFromApi && typeof nameFromApi === "string") {
          setRestaurantName(nameFromApi);
        }
      } catch {
        setRestaurantName("Restaurant Management");
      } finally {
        setLogoLoading(false);
      }
    };

    fetchBranding();
  }, []);

  const roleConfig = {
    waiter: {
      label: "Waiter",
      className:
        "bg-sky-100 text-sky-800 border-sky-200",
    },
    admin: {
      label: "Admin",
      className:
        "bg-red-100 text-red-700 border-red-200",
    },
    chef: {
      label: "Chef",
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    guest: {
      label: "Guest",
      className:
        "bg-neutral-100 text-neutral-700 border-neutral-200",
    },
  };

  const currentRole =
    roleConfig[role] || roleConfig.guest;

  const handleReportIssue = async () => {
    try {
      const waiterName =
        localStorage.getItem("waiterName") || "Unknown";
      const currentRoleValue =
        localStorage.getItem("role") || role || "guest";
      const context =
        window.location.pathname + window.location.search;

      const payload = {
        restaurantName,
        waiterName,
        role: currentRoleValue,
        context,
        source: "waiter-dashboard-footer",
        message:
          "Issue reported from waiter dashboard. Please follow up with this user.",
      };

      const token = localStorage.getItem("token");
      await fetch("/api/restaurant/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Issue reported",
        description:
          "Your report has been sent to the restaurant admin.",
      });
    } catch {
      toast({
        title: "Failed to report issue",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="w-full border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Section 1: Branding + logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Mini ring logo with same logic as navbar */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#C3110C] bg-white shadow-sm overflow-hidden">
                {logoLoading ? (
                  <div className="h-full w-full animate-pulse bg-neutral-100 rounded-full" />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Restaurant Logo"
                    className="h-full w-full object-cover rounded-full"
                    onError={() => setLogoUrl(null)}
                  />
                ) : (
                  <span className="text-[7px] font-extrabold leading-tight tracking-tight text-[#C3110C] select-none text-center">
                    neo
                    <br />
                    RMS
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  {restaurantName}
                </h2>
                <p className="text-xs text-neutral-500">
                  Restaurant Management Dashboard
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${currentRole.className}`}
            >
              Role: {currentRole.label}
            </span>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                to="/waiter/dashboard"
                className="text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4"
              >
                Dashboard
              </Link>
              <Link
                to="/waiter/create-order"
                className="text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4"
              >
                Create Order
              </Link>
              <Link
                to="/waiter/orders"
                className="text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4"
              >
                Active Orders
              </Link>
              <Link
                to="/waiter/orders?status=Ready"
                className="text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4"
              >
                Billing
              </Link>
            </nav>
          </div>

          {/* Section 3: Support */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Support
            </h3>
            <div className="space-y-1 text-sm text-neutral-600">
              <button
                type="button"
                onClick={handleReportIssue}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Report Issue</span>
              </button>
              <p>Contact Admin</p>
              <p className="text-xs text-neutral-500">
                System Status:{" "}
                <span className="font-medium text-emerald-700">
                  Operational
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="border-t border-neutral-200 px-6 py-3">
        <p className="text-center text-[11px] text-neutral-500 leading-relaxed">
          &copy; 2026 Restaurant System. All rights reserved.
          <br />
          Version 1.0.0
        </p>
      </div>
    </footer>
  );
}

export default WaiterFooter;


