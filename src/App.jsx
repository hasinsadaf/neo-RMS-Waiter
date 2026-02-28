import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/waiter/Dashboard.jsx";
import CreateOrder from "./pages/waiter/CreateOrder.jsx";
import ActiveOrders from "./pages/waiter/ActiveOrders.jsx";
import Billing from "./pages/waiter/Billing.jsx";
import OrderConfirmation from "./pages/waiter/OrderConfirmation.jsx";
import Profile from "./pages/waiter/Profile.jsx";
import WaiterLogin from "./pages/auth/Login.jsx";
import RequireWaiterAuth from "./components/routing/RequireWaiterAuth.jsx";
import WaiterShell from "./components/layout/WaiterShell.jsx";

function HomeRedirect() {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("authRole");
  const isWaiter = !role || role === "WAITER";
  return (
    <Navigate
      to={token && isWaiter ? "/waiter/dashboard" : "/waiter/login"}
      replace
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/waiter/login" element={<WaiterLogin />} />

      <Route element={<RequireWaiterAuth />}>
        <Route element={<WaiterShell />}>
          <Route path="/waiter/dashboard" element={<Dashboard />} />
          <Route path="/waiter/create-order" element={<CreateOrder />} />
          <Route path="/waiter/orders" element={<ActiveOrders />} />
          <Route path="/waiter/billing/:id" element={<Billing />} />
          <Route
            path="/waiter/order-confirmation"
            element={<OrderConfirmation />}
          />
          <Route path="/waiter/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
