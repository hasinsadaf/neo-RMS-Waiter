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
      console.log("Login successful (raw response):", data);
      console.log("Full data structure:", JSON.stringify(data, null, 2));
      
      // also log token/user for easy inspection
      console.log("accessToken", data?.data?.accessToken);
      console.log("user", data?.data?.user);

      const { accessToken, user } = data?.data ?? {};

      if (!accessToken || !user?.role) throw new Error("Invalid response from server");

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authRole", user.role);
      localStorage.setItem("role", String(user.role).toLowerCase());
      
      // Store user IDs and identifiers
      if (user?.id) localStorage.setItem("waiterId", user.id);
      if (user?.restaurantId) localStorage.setItem("restaurantId", user.restaurantId);
      if (user?.tenantId) localStorage.setItem("tenantId", user.tenantId);
      
      // Check alternative locations for restaurantId and tenantId
      // Some APIs return these at the root level or in different nested structures
      const restaurantId = user?.restaurantId || data?.data?.restaurantId || user?.restaurant_id || data?.restaurantId;
      const tenantId = user?.tenantId || data?.data?.tenantId || user?.tenant_id || data?.tenantId;
      
      if (restaurantId) localStorage.setItem("restaurantId", restaurantId);
      if (tenantId) localStorage.setItem("tenantId", tenantId);
      
      // debug log storage values
      console.log("stored restaurantId", localStorage.getItem("restaurantId"));
      console.log("stored tenantId", localStorage.getItem("tenantId"));
      console.log("⚠️ If these are null, check the response structure above and update the code accordingly");
      
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
    <AuthCard title="Welcome back" description="Sign In to Manage Orders.">
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
        submitLabel="Sign in"
      />
      <p className="mt-4 text-xs text-neutral-400">
        Waiter should use their assigned credentials.
      </p>
    </AuthCard>
  );
}