import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { createOrder } from "../../services/order";

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

const INITIAL_ITEM = { name: "", quantity: 1, price: 0 };

function CreateOrder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([{ ...INITIAL_ITEM }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "price"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...INITIAL_ITEM }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        tableNumber: Number(tableNumber),
        customerName,
        items: items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
        })),
        subtotal,
        vat,
        total,
      };

      const createdOrder = await createOrder(payload);

      toast({
        title: "Order Created Successfully",
        description: "The order has been saved.",
      });

      navigate("/waiter/order-confirmation", {
        state: { order: createdOrder },
      });
    } catch (error) {
      toast({
        title: "Failed to create order",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-white text-neutral-900 px-4 py-8">
      <Card className="w-full max-w-7xl rounded-xl border border-neutral-200 bg-white shadow-xl">
        <CardHeader className="border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4D4F]/10 text-[#FF4D4F]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create New Order
            </CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-0 pt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Order Details and Items */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                {/* Customer Info */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="tableNumber"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Table Number
                    </Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      min={1}
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F]"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Items
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      className="gap-1 rounded-full border-[#FF4D4F] bg-[#FF4D4F] text-white hover:bg-[#FF7F7F] hover:border-[#FF7F7F]"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs font-medium">Add Item</span>
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 rounded-lg border border-neutral-200 p-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 md:flex-row md:items-end"
                      >
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`item-name-${index}`}
                            className="text-xs font-medium text-neutral-300"
                          >
                            Dish Name
                          </Label>
                          <Input
                            id={`item-name-${index}`}
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(index, "name", e.target.value)
                            }
                            className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F]"
                            placeholder="Margherita Pizza"
                            required
                          />
                        </div>

                        <div className="grid flex-1 grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`item-qty-${index}`}
                              className="text-xs font-medium text-neutral-300"
                            >
                              Qty
                            </Label>
                            <Input
                              id={`item-qty-${index}`}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", e.target.value)
                              }
                              className="bg-white border-neutral-300 text-neutral-900 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F]"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor={`item-price-${index}`}
                              className="text-xs font-medium text-neutral-300"
                            >
                              Price
                            </Label>
                            <Input
                              id={`item-price-${index}`}
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(index, "price", e.target.value)
                              }
                              className="bg-white border-neutral-300 text-neutral-900 focus-visible:ring-[#FF4D4F] focus-visible:border-[#FF4D4F]"
                              required
                            />
                          </div>

                          <div className="flex items-end justify-between gap-2">
                            <div className="space-y-1 text-xs text-neutral-400">
                              <span>Line Total</span>
                              <div className="text-sm font-semibold text-neutral-100">
                                {((Number(item.quantity) || 0) *
                                  (Number(item.price) || 0)
                                ).toFixed(2)}
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-9 w-9 shrink-0 rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500"
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary and Date/Time */}
              <div className="space-y-6">
                {/* Date and Time Section */}
                <Card className="border border-neutral-200 bg-neutral-50">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#FF4D4F]" />
                        <span className="text-sm font-medium text-neutral-600">
                          Date
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {currentDateTime.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <Separator className="bg-neutral-200" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#FF4D4F]" />
                        <span className="text-sm font-medium text-neutral-600">
                          Time
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {currentDateTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary Section */}
                <Card className="border border-neutral-200 bg-gradient-to-b from-orange-50 to-orange-100/30 sticky top-6">
                  <CardContent className="space-y-4 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                      Order Summary
                    </h3>
                    <Separator className="bg-neutral-200" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Subtotal</span>
                        <span className="font-semibold text-neutral-900">
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Tax (5%)</span>
                        <span className="font-semibold text-neutral-900">
                          {vat.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="bg-neutral-200" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">Total</span>
                        <span className="text-2xl font-bold text-[#FF4D4F]">
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="rounded-full"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default CreateOrder;

