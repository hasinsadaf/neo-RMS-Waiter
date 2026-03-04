import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWaiter } from "@/services/auth";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthCard from "../../components/auth/AuthCard";
import AuthForm from "../../components/auth/AuthForm";

export default function WaiterLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError("");

    try {
      const data = await loginWaiter(email, password);
      const { accessToken, user } = data?.data ?? {};

      if (!accessToken) throw new Error("Invalid response from server");

      // login() stores the token then calls /user/getme for tenantId
      await login(accessToken, user);

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