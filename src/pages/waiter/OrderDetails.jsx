import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../../services/order";
import { Calendar, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui-waiter/card";
import { Button } from "../../components/ui-waiter/button";
import { Separator } from "../../components/ui-waiter/separator";
import { getDisplayOrderId } from "../../utils/orderId";

function StatusBadge({ status }) {
  const formattedStatus =
    status?.charAt(0) + status?.slice(1).toLowerCase();

  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

  const variants = {
    PENDING: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    PREPARING: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    READY: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    SERVED: "bg-blue-50 text-blue-700 border border-blue-200",
    default: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  };

  const classes = variants[status] || variants.default;

  return (
    <span className={`${baseClasses} ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current/70 mr-1.5" />
      {formattedStatus}
    </span>
  );
}

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const fetchOrder = async () => {
    if (!id) {
      setError("Order ID is missing in the URL.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getOrder(id);
      setOrder(response?.data || null);
    } catch (err) {
      console.error("[OrderDetails] fetch error", err);
      setError("Failed to load order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      setUpdateError(null);

      await updateOrderStatus(order.id, newStatus);
      
      // Update the local order state with new status
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: newStatus,
      }));
    } catch (err) {
      console.error("[OrderDetails] update status error", err);
      setUpdateError("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine which status transitions are allowed
  const getNextStatus = () => {
    if (!order) return null;

    const currentStatus = order.status;

    if (currentStatus === "PENDING") {
      return "CONFIRMED";
    } else if (currentStatus === "READY") {
      return "DELIVERED";
    }

    return null;
  };

  const nextStatus = getNextStatus();

  const subtotal =
    order?.items?.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.price),
      0
    ) || 0;

  const totalAmount = Number(order?.totalPrice || 0);

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="rounded-xl border border-neutral-200 bg-white shadow-xl">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">
                  Order Details
                </CardTitle>
                {order && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    ORDER #{getDisplayOrderId(order.id)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-sm text-neutral-500">
                Loading order details...
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchOrder}
                  className="rounded-full"
                >
                  Retry
                </Button>
              </div>
            ) : order ? (
              <div className="space-y-8">

                {/* Update Error Alert */}
                {updateError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {updateError}
                  </div>
                )}

                {/* Order Info */}
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-neutral-500">Order Type</span>
                    <p className="font-semibold text-neutral-900">
                      {order.orderType}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Status</span>
                    <div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Payment Method</span>
                    <p className="font-semibold text-neutral-900">
                      {order.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Payment Status</span>
                    <p className="font-semibold text-neutral-900">
                      {order.paymentStatus}
                    </p>
                  </div>
                  {order.createdAt && (
                    <>
                      <div>
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created Date
                        </span>
                        <p className="font-semibold text-neutral-900">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created Time
                        </span>
                        <p className="font-semibold text-neutral-900">
                          {new Date(order.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Status Update Section */}
                {nextStatus && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      Update Order Status
                    </p>
                    <Button
                      type="button"
                      onClick={() => handleStatusUpdate(nextStatus)}
                      disabled={isUpdating}
                      className="rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isUpdating
                        ? "Updating..."
                        : `Change to ${nextStatus.toLowerCase()}`}
                    </Button>
                  </div>
                )}

                {order.status !== "PENDING" &&
                  order.status !== "READY" &&
                  order.status !== "DELIVERED" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-semibold mb-1">Status Update Not Available</p>
                      <p>
                        The status will be changed automatically when the kitchen updates it to <strong>READY</strong>. You can then mark it as delivered.
                      </p>
                    </div>
                  )}

                <Separator className="bg-neutral-200" />

                {/* Items Table */}
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => {
                        const quantity = Number(item.quantity);
                        const price = Number(item.price);
                        const lineTotal = quantity * price;

                        return (
                          <tr
                            key={item.id}
                            className="border-t border-neutral-100"
                          >
                            <td className="px-4 py-3 text-neutral-900">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {item.name}
                                </span>

                                {item.variantType && (
                                  <span className="inline-block mt-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 w-fit">
                                    {item.variantType}
                                  </span>
                                )}

                                {item.notes && (
                                  <span className="text-xs text-neutral-400 mt-1 italic">
                                    Note: {item.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right">
                              {quantity}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {price.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold">
                              {lineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                No order data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderDetails;