import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserProfile, loginWaiter } from "@/services/auth";
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

      const meResponse = await getCurrentUserProfile(accessToken);
      console.log("/user/me response (raw):", meResponse);
      console.log("/user/me full structure:", JSON.stringify(meResponse, null, 2));

      const meData = meResponse?.data ?? {};
      const waiterProfile = meData?.Waiter ?? {};

      if (waiterProfile?.tenantId) {
        localStorage.setItem("tenantId", waiterProfile.tenantId);
      }

      if (waiterProfile?.restaurantId) {
        localStorage.setItem("restaurantId", waiterProfile.restaurantId);
      }

      if (waiterProfile?.id) {
        localStorage.setItem("waiterId", waiterProfile.id);
      }
      
      const name = meData?.fullName || user?.fullName || user?.name || user?.username || "Waiter";
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