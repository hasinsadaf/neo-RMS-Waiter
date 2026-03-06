import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Check,
  Clock,
  ClipboardList,
  Grid3X3,
  Minus,
  Plus,
  Search,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import { createOrder } from "../../services/order";
import { fetchRestaurantMenu } from "../../services/menu";
import { fetchTablesByRestaurant } from "../../services/table";

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

const FIXED_CUSTOMER_ID = "11111111-1111-1111-1111-111111111115";
const DEFAULT_ORDER_TYPE = "DINE_IN";
const DEFAULT_PAYMENT_METHOD = "CASH";

const MOCK_CUSTOMERS = [
  {
    id: FIXED_CUSTOMER_ID,
    name: "Aarav Perera",
    phone: "+94 77 568 1234",
  },
  {
    id: FIXED_CUSTOMER_ID,
    name: "Nethmi Silva",
    phone: "+94 71 442 9801",
  },
  {
    id: FIXED_CUSTOMER_ID,
    name: "Daniel Fernando",
    phone: "+94 76 330 1188",
  },
];

function normalizeMenuItem(raw) {
  const variants = Array.isArray(raw?.variants) ? raw.variants : [];
  const firstVariant = variants[0] || {};
  const image =
    (Array.isArray(raw?.images) && raw.images[0]) ||
    raw?.image ||
    raw?.imageUrl ||
    "";

  const price = Number(firstVariant.price ?? raw?.price ?? 0);

  return {
    id: raw?._id ?? raw?.id,
    variantId: firstVariant?._id ?? firstVariant?.id ?? "",
    name: raw?.name ?? "Unnamed Item",
    category: raw?.category ?? raw?.categoryName ?? "Menu",
    description: raw?.description ?? "",
    image,
    price: Number.isFinite(price) ? price : 0,
  };
}

function normalizeTable(raw) {
  return {
    id: raw?.id ?? raw?._id ?? "",
    tableNumber: raw?.tableNumber ?? raw?.number ?? raw?.name ?? "-",
    capacity: Number(raw?.capacity ?? 0),
  };
}

function CreateOrder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tableSearch, setTableSearch] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(MOCK_CUSTOMERS[0]);

  const [menuItems, setMenuItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMenu = async () => {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) {
        setMenuItems([]);
        return;
      }

      try {
        setIsMenuLoading(true);
        const response = await fetchRestaurantMenu(restaurantId);
        if (cancelled) return;

        const normalizedMenu = response
          .map(normalizeMenuItem)
          .filter((menuItem) => menuItem.id && menuItem.name);

        setMenuItems(normalizedMenu);
        if (normalizedMenu.length > 0) {
          setSelectedMenuItemId(normalizedMenu[0].id);
        }
      } catch {
        if (!cancelled) {
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsMenuLoading(false);
        }
      }
    };

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTables = async () => {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) {
        setTables([]);
        return;
      }

      try {
        setIsTableLoading(true);
        const response = await fetchTablesByRestaurant(restaurantId);
        if (cancelled) return;

        const normalizedTables = response
          .map(normalizeTable)
          .filter((table) => table.id);

        setTables(normalizedTables);
        if (normalizedTables.length > 0) {
          setSelectedTableId(normalizedTables[0].id);
        }
      } catch {
        if (!cancelled) {
          setTables([]);
        }
      } finally {
        if (!cancelled) {
          setIsTableLoading(false);
        }
      }
    };

    loadTables();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTables = useMemo(() => {
    const search = tableSearch.trim().toLowerCase();
    if (!search) return tables;

    return tables.filter((table) => {
      const tableNo = String(table.tableNumber).toLowerCase();
      const capacity = String(table.capacity).toLowerCase();
      return tableNo.includes(search) || capacity.includes(search);
    });
  }, [tableSearch, tables]);

  useEffect(() => {
    if (filteredTables.length === 0) {
      setSelectedTableId("");
      return;
    }

    const selectedExists = filteredTables.some(
      (table) => table.id === selectedTableId
    );

    if (!selectedExists) {
      setSelectedTableId(filteredTables[0].id);
    }
  }, [filteredTables, selectedTableId]);

  const filteredCustomers = useMemo(() => {
    const search = customerQuery.trim().toLowerCase();
    if (!search) return MOCK_CUSTOMERS;

    return MOCK_CUSTOMERS.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search)
    );
  }, [customerQuery]);

  useEffect(() => {
    if (filteredCustomers.length === 0) {
      setSelectedCustomer(null);
      return;
    }

    const stillAvailable = filteredCustomers.some(
      (customer) => customer.name === selectedCustomer?.name
    );

    if (!stillAvailable) {
      setSelectedCustomer(filteredCustomers[0]);
    }
  }, [filteredCustomers, selectedCustomer]);

  const filteredMenuItems = useMemo(() => {
    const search = menuSearch.trim().toLowerCase();
    if (!search) return menuItems;

    return menuItems.filter(
      (menuItem) =>
        menuItem.name.toLowerCase().includes(search) ||
        menuItem.category.toLowerCase().includes(search)
    );
  }, [menuItems, menuSearch]);

  useEffect(() => {
    if (filteredMenuItems.length === 0) {
      setSelectedMenuItemId("");
      return;
    }

    const selectedExists = filteredMenuItems.some(
      (menuItem) => menuItem.id === selectedMenuItemId
    );

    if (!selectedExists) {
      setSelectedMenuItemId(filteredMenuItems[0].id);
    }
  }, [filteredMenuItems, selectedMenuItemId]);

  const selectedMenuItem = filteredMenuItems.find(
    (menuItem) => menuItem.id === selectedMenuItemId
  );
  const selectedTable = filteredTables.find(
    (table) => table.id === selectedTableId
  );

  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const total = subtotal;

  const handleAddSelectedMenuItem = () => {
    if (!selectedMenuItem) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.menuItemId === selectedMenuItem.id &&
          item.variantId === selectedMenuItem.variantId
      );

      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Number(item.quantity || 0) + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          menuItemId: selectedMenuItem.id,
          variantId: selectedMenuItem.variantId,
          name: selectedMenuItem.name,
          quantity: 1,
          price: selectedMenuItem.price,
          category: selectedMenuItem.category,
          image: selectedMenuItem.image,
        },
      ];
    });
  };

  const updateItem = (index, updater) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updater(item) } : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!selectedTable) {
      toast({
        title: "Table is required",
        description: "Please select a table before creating the order.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Customer is required",
        description: "Please select a customer from the mock list.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No menu items selected",
        description: "Please add at least one menu item.",
        variant: "destructive",
      });
      return;
    }

    const restaurantId = localStorage.getItem("restaurantId");
    if (!restaurantId) {
      toast({
        title: "Restaurant is missing",
        description: "Restaurant ID is not available in the current session.",
        variant: "destructive",
      });
      return;
    }

    const itemWithoutVariant = items.find((item) => !item.variantId);
    if (itemWithoutVariant) {
      toast({
        title: "Variant not available",
        description: `Selected item \"${itemWithoutVariant.name}\" has no variant ID.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        restaurantId,
        orderType: DEFAULT_ORDER_TYPE,
        paymentMethod: DEFAULT_PAYMENT_METHOD,
        totalPrice: Number(total.toFixed(2)),
        tableId: selectedTable.id,
        tableNumber: Number(selectedTable.tableNumber) || selectedTable.tableNumber,
        customerId: FIXED_CUSTOMER_ID,
        customerName: selectedCustomer.name,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          name: item.name,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
        })),
        subtotal,
        total,
      };

      const createdOrder = await createOrder(payload);

      toast({
        title: "Order Created Successfully",
        description: "The order has been saved.",
      });

      navigate("/waiter/order-confirmation", {
        state: {
          order: createdOrder,
          fallback: {
            tableNumber: selectedTable.tableNumber,
            total,
          },
        },
      });
    } catch {
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
              <div className="lg:col-span-2 flex flex-col space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4 text-[#FF4D4F]" />
                      <Label className="text-sm font-semibold text-neutral-800">
                        Table Selection
                      </Label>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Search table number or capacity"
                        className="pl-9 border-neutral-300"
                      />
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {isTableLoading && (
                        <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-4 text-sm text-neutral-500">
                          Loading tables...
                        </div>
                      )}

                      {!isTableLoading && filteredTables.length === 0 && (
                        <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-4 text-sm text-neutral-500">
                          No tables found for this search.
                        </div>
                      )}

                      {!isTableLoading &&
                        filteredTables.map((table) => {
                          const active = selectedTableId === table.id;

                          return (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => setSelectedTableId(table.id)}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                                active
                                  ? "border-neutral-800 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                                  : "border-neutral-200 bg-[#FAFAFA] hover:border-neutral-300 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                              }`}
                              style={{
                                backgroundColor: "#ffffff",
                                borderColor: active ? "#262626" : "#e5e5e5",
                                color: "#171717",
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-medium text-neutral-800">
                                  Table {table.tableNumber}
                                </div>
                                {active && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-400 bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-800">
                                    <Check className="h-3 w-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500">
                                Capacity: {table.capacity || "-"}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#FF4D4F]" />
                      <Label className="text-sm font-semibold text-neutral-800">
                        Customer Selection (Mock)
                      </Label>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        value={customerQuery}
                        onChange={(e) => setCustomerQuery(e.target.value)}
                        placeholder="Search by customer name or phone"
                        className="pl-9 border-neutral-300"
                      />
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => {
                          const active = selectedCustomer?.name === customer.name;

                          return (
                            <button
                              key={`${customer.name}-${customer.phone}`}
                              type="button"
                              onClick={() => setSelectedCustomer(customer)}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                                active
                                  ? "border-neutral-800 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                                  : "border-neutral-200 bg-[#FAFAFA] hover:border-neutral-300 hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                              }`}
                              style={{
                                backgroundColor: "#ffffff",
                                borderColor: active ? "#262626" : "#e5e5e5",
                                color: "#171717",
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-medium text-neutral-800">
                                  {customer.name}
                                </div>
                                {active && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-400 bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-800">
                                    <Check className="h-3 w-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {customer.phone}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-4 text-sm text-neutral-500">
                          No mock customers found for this search.
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-500">
                      Selected customer submits fixed ID: {FIXED_CUSTOMER_ID}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-[#FF4D4F]" />
                      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-600">
                        Menu Item Selector
                      </h2>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSelectedMenuItem}
                      disabled={!selectedMenuItem || isMenuLoading}
                      className="gap-1 rounded-xl border-neutral-300 px-4 text-neutral-700 hover:bg-neutral-100"
                      style={{
                        backgroundColor: selectedMenuItem ? "#262626" : "#f5f5f5",
                        borderColor: selectedMenuItem ? "#262626" : "#d4d4d8",
                        color: selectedMenuItem ? "#ffffff" : "#737373",
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add to Order
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <Input
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search menu item or category"
                        className="pl-9 border-neutral-300"
                      />
                    </div>

                    <select
                      value={selectedMenuItemId}
                      onChange={(e) => setSelectedMenuItemId(e.target.value)}
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus-visible:ring-1 focus-visible:ring-[#FF4D4F]"
                    >
                      {filteredMenuItems.length > 0 ? (
                        filteredMenuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} • {menuItem.category} • {menuItem.price.toFixed(2)}
                          </option>
                        ))
                      ) : (
                        <option value="">No menu items available</option>
                      )}
                    </select>
                  </div>

                  {selectedMenuItem && (
                    <div className="rounded-xl border border-neutral-300 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                        Currently Selected Item
                      </p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {selectedMenuItem.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {selectedMenuItem.category}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {selectedMenuItem.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        Click “Add to Order” to include this item in the order list.
                      </p>
                    </div>
                  )}

                  {isMenuLoading && (
                    <p className="text-sm text-neutral-500">Loading menu items...</p>
                  )}

                  {!isMenuLoading && menuItems.length === 0 && (
                    <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-500">
                      No menu items available. Verify restaurant menu setup.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Selected Menu Items
                    </h2>
                    <span className="text-xs text-neutral-500">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto rounded-lg border border-neutral-200 p-4">
                    {items.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                        Select a menu item above and click “Add to Order”.
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <div
                          key={`${item.menuItemId}-${index}`}
                          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-neutral-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-neutral-500">{item.category}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-none text-neutral-600"
                                  onClick={() =>
                                    updateItem(index, (current) => ({
                                      quantity: Math.max(
                                        1,
                                        Number(current.quantity || 0) - 1
                                      ),
                                    }))
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(index, () => ({
                                      quantity: Math.max(1, Number(e.target.value) || 1),
                                    }))
                                  }
                                  className="h-9 w-16 rounded-none border-0 bg-transparent px-2 text-center"
                                />

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-none text-neutral-600"
                                  onClick={() =>
                                    updateItem(index, (current) => ({
                                      quantity: Number(current.quantity || 0) + 1,
                                    }))
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.price}
                                onChange={(e) =>
                                  updateItem(index, () => ({
                                    price: Math.max(0, Number(e.target.value) || 0),
                                  }))
                                }
                                className="h-9 w-28 border-neutral-300 text-right"
                              />

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="h-9 w-9 rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-sm">
                            <span className="text-neutral-500">
                              Unit: {Number(item.price || 0).toFixed(2)}
                            </span>
                            <span className="font-semibold text-neutral-900">
                              Line Total: {(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
              className="rounded-xl border-neutral-300 px-5 text-neutral-700 hover:bg-neutral-100"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#d4d4d8",
                color: "#262626",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-5 bg-neutral-900 text-white hover:bg-neutral-800"
              style={{
                backgroundColor: "#262626",
                color: "#ffffff",
                borderColor: "#262626",
              }}
              disabled={isSubmitting || items.length === 0}
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
