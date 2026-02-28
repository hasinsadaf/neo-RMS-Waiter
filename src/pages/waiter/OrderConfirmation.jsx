import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui-waiter/card";
import { Button } from "../../components/ui-waiter/button";

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderFromState = location.state?.order || location.state || {};
  const orderId = orderFromState.id ?? orderFromState.orderId;
  const tableNumber =
    orderFromState.tableNumber ?? orderFromState.table_no ?? "-";
  const total =
    typeof orderFromState.total === "number"
      ? orderFromState.total
      : Number(orderFromState.total || 0);

  const handleViewActiveOrders = () => {
    navigate("/waiter/orders");
  };

  const handleCreateAnother = () => {
    navigate("/waiter/create-order");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-neutral-900 px-4 py-8">
      <Card className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl text-center">
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
              Order Successfully Created!
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          {orderId && (
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">Order ID:</span>{" "}
              #{orderId}
            </p>
          )}
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">Table:</span>{" "}
            {tableNumber}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">Total Amount:</span>{" "}
            {total.toFixed(2)}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          <Button
            type="button"
            className="w-full rounded-full"
            onClick={handleViewActiveOrders}
          >
            View Active Orders
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={handleCreateAnother}
          >
            Create Another Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default OrderConfirmation;

