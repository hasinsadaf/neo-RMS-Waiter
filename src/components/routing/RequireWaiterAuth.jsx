import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireWaiterAuth() {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("authRole");

  if (!token) {
    return <Navigate to="/waiter/login" state={{ from: location }} replace />;
  }

  if (role && role !== "WAITER") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authRole");
    return <Navigate to="/waiter/login" replace />;
  }

  return <Outlet />;
}

