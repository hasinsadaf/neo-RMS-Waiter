import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWaiter } from "@/services/auth";
import AuthCard from "../../components/auth/AuthCard"; 
import AuthForm from "../../components/auth/AuthForm";

export default function WaiterLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");

    try {
      const data = await loginWaiter(email, password);
      console.log("Login successful:", data);

      const { accessToken, user } = data?.data ?? {};

      if (!accessToken || !user?.role) throw new Error("Invalid response from server");

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authRole", user.role);
      localStorage.setItem("role", String(user.role).toLowerCase());
      
      // Store user IDs and identifiers
      if (user?.id) localStorage.setItem("waiterId", user.id);
      if (user?.restaurantId) localStorage.setItem("restaurantId", user.restaurantId);
      if (user?.tenantId) localStorage.setItem("tenantId", user.tenantId);
      
      const name = user?.fullName || user?.name || user?.username || "Waiter";
      localStorage.setItem("userName", name);
      // also set waiterName for navbar convenience
      localStorage.setItem("waiterName", name);

      // go to waiter dashboard after successful login
      navigate("/waiter/dashboard", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" description="Sign in to manage your restaurant operations.">
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        submitLabel="Sign in"
      />
      <p className="mt-4 text-xs text-neutral-400">
        Only the restaurant owner can self-register. Managers and staff should use their assigned credentials.
      </p>
    </AuthCard>
  );
}