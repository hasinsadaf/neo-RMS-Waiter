import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import WaiterNavbar from "./WaiterNavbar.jsx";
import WaiterFooter from "./WaiterFooter.jsx";

export default function WaiterShell() {
  // attempt to populate waiter profile (name) from backend if missing
  useEffect(() => {
    const name = localStorage.getItem("waiterName") || localStorage.getItem("userName");
    if (name) return; // already set

    let mounted = true;
    (async () => {
      try {
        const api = (await import("@/services/api")).default;
        const possiblePaths = ["/auth/me", "/users/me", "/me"];
        for (const p of possiblePaths) {
          try {
            const res = await api.get(p);
            const data = res?.data?.data || res?.data || {};
            const fetchedName = data?.fullName || data?.name || data?.username;
            if (mounted && fetchedName) {
              localStorage.setItem("waiterName", fetchedName);
              localStorage.setItem("userName", fetchedName);
              break;
            }
          } catch (err) {
            // try next path
          }
        }
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <WaiterNavbar />
      <div className="flex min-h-screen flex-col pt-16">
        <main className="flex-1">
          <Outlet />
        </main>
        <WaiterFooter />
      </div>
    </>
  );
}

