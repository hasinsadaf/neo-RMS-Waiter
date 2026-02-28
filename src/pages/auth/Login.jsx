import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
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
      const response = await api.post("/auth/login/waiter", { email, password });
      console.log("Login successful:", response);

      const { accessToken, user } = response.data?.data ?? {};

      if (!accessToken || !user?.role) throw new Error("Invalid response from server");

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authRole", user.role);
      localStorage.setItem("role", String(user.role).toLowerCase());
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