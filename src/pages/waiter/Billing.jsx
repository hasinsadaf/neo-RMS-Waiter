import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import api from "../../services/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui-waiter/card";
import { Label } from "../../components/ui-waiter/label";
import { Input } from "../../components/ui-waiter/input";
import { Button } from "../../components/ui-waiter/button";
import { Separator } from "../../components/ui-waiter/separator";
import { useToast } from "../../components/ui-waiter/use-toast";

function Billing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const totalAmount = Number(order?.total || 0);
  const paidNumeric = Number(paidAmount || 0);
  const changeAmount =
    !Number.isNaN(paidNumeric) && paidNumeric > totalAmount
      ? paidNumeric - totalAmount
      : 0;

  const fetchOrder = async () => {
    if (!id) {
      setError("Order ID is missing in the URL.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/orders/${id}`);
      setOrder(response.data || null);
    } catch (err) {
      setError("Failed to load order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleConfirmPayment = async () => {
    if (!order) return;
    if (isPaying) return;

    const paid = Number(paidAmount);
    const total = Number(order.total || 0);

    if (Number.isNaN(paid) || paid <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid paid amount.",
        variant: "destructive",
      });
      return;
    }

    if (paid < total) {
      toast({
        title: "Insufficient amount",
        description: `Paid amount must be at least ${total.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPaying(true);

      await api.post(`/orders/${order.id}/pay`, {
        paymentMethod,
        paidAmount: paid,
      });

      setOrder((prev) =>
        prev ? { ...prev, status: "Paid" } : prev
      );

      toast({
        title: "Payment Successful",
        description: "The order has been marked as paid.",
      });

      navigate("/waiter/orders");
    } catch (err) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong while processing the payment.",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const disabled =
    isLoading || !order || isPaying || !paidAmount || Number.isNaN(paidNumeric);

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="rounded-xl border border-neutral-200 bg-white shadow-xl">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#C3110C]/10 text-[#C3110C]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
                    Billing &amp; Payment
                  </CardTitle>
                  {order && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                      ORDER #{order.id}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-8 animate-pulse">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="h-4 w-32 rounded bg-neutral-200" />
                    <div className="h-4 w-48 rounded bg-neutral-200" />
                    <div className="h-4 w-40 rounded bg-neutral-200" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 rounded bg-neutral-200" />
                    <div className="h-4 w-28 rounded bg-neutral-200" />
                    <div className="h-4 w-20 rounded bg-neutral-200" />
                  </div>
                </div>
                <div className="h-32 w-full rounded-xl bg-neutral-100" />
                <div className="h-40 w-full rounded-xl bg-neutral-100" />
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
              <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {/* Order Details */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Order Details
                    </h2>
                    <div className="grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
                      <div>
                        <span className="text-neutral-500">Table Number</span>
                        <p className="text-base font-semibold text-neutral-900">
                          {order.tableNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500">Customer Name</span>
                        <p className="text-base font-semibold text-neutral-900">
                          {order.customerName || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-neutral-200" />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Items
                    </h3>

                    <div className="overflow-hidden rounded-xl border border-neutral-200">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          <tr>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-right">
                              Line Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.map((item, index) => {
                              const quantity = Number(item.quantity || 0);
                              const price = Number(item.price || 0);
                              const lineTotal = quantity * price;

                              return (
                                <tr
                                  key={`${item.name}-${index}`}
                                  className="border-t border-neutral-100"
                                >
                                  <td className="px-4 py-3 text-sm text-neutral-900">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm text-neutral-700">
                                    {quantity}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm text-neutral-700">
                                    {price.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">
                                    {lineTotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-6 text-center text-sm text-neutral-500"
                              >
                                No items found for this order.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 pt-3 text-sm text-neutral-700">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-neutral-900">
                          {Number(order.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>VAT</span>
                        <span className="font-semibold text-neutral-900">
                          {Number(order.vat || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
                        <span>Total</span>
                        <span>{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="space-y-6 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 md:p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Payment
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="paymentMethod"
                        className="text-sm font-medium text-neutral-700"
                      >
                        Payment Method
                      </Label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C3110C] focus-visible:border-[#C3110C]"
                        disabled={isPaying}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="paidAmount"
                        className="text-sm font-medium text-neutral-700"
                      >
                        Paid Amount
                      </Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-[#C3110C] focus-visible:border-[#C3110C]"
                        placeholder="0.00"
                        disabled={isPaying}
                      />
                    </div>

                    <div className="space-y-1 rounded-lg bg-white px-3 py-2 text-sm">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Total</span>
                        <span className="font-semibold text-neutral-900">
                          {totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Paid</span>
                        <span className="font-semibold text-neutral-900">
                          {paidAmount ? paidNumeric.toFixed(2) : "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-700">
                        <span>Change</span>
                        <span className="text-base font-semibold text-neutral-900">
                          {changeAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                No order data available.
              </div>
            )}
          </CardContent>

          {!isLoading && !error && order && (
            <CardFooter className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => navigate(-1)}
                disabled={isPaying}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full"
                onClick={handleConfirmPayment}
                disabled={disabled}
              >
                {isPaying ? "Processing..." : "Confirm Payment"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Billing;

