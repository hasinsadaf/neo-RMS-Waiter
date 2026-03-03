import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import WaiterSidebar from "./WaiterSidebar.jsx";
import WaiterFooter from "./WaiterFooter.jsx";
import { fetchCurrentUserName } from "../../services/profile";


export default function WaiterShell() {
  // attempt to populate waiter profile (name) from backend if missing
  useEffect(() => {
    const name = localStorage.getItem("waiterName") || localStorage.getItem("userName");
    if (name) return; // already set

    let mounted = true;
    (async () => {
      try {
        const fetchedName = await fetchCurrentUserName();
        if (mounted && fetchedName) {
          localStorage.setItem("waiterName", fetchedName);
          localStorage.setItem("userName", fetchedName);
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
      <WaiterSidebar />
      <div className="flex min-h-screen">
        {/* push content right on medium+ screens to make room for fixed sidebar */}
        <main className="flex-1 md:ml-60 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <WaiterFooter />
        </main>
      </div>
    </>
  );
}

