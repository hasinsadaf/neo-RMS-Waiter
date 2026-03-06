import React from "react";
import { useSocket } from "../../context/SocketContext";
import { Bell, X, Clock, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { getDisplayOrderId } from "../../utils/orderId";

const NotificationCenter = () => {
  const { alerts, clearAlert, clearAllAlerts } = useSocket();

  const getEventIcon = (event) => {
    switch (event) {
      case "orderPlaced":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "orderConfirmation":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "orderReady":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "orderDelivered":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "orderCancelled":
      case "orderCancelledByChef":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTitle = (event) => {
    switch (event) {
      case "orderPlaced":
        return "New Order";
      case "orderConfirmation":
        return "Order Confirmed";
      case "orderReady":
        return "Order Ready";
      case "orderDelivered":
        return "Order Delivered";
      case "orderCancelled":
        return "Order Cancelled";
      case "orderCancelledByChef":
        return "Cancelled by Chef";
      case "socketError":
        return "Connection Error";
      default:
        return "Notification";
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case "orderPlaced":
        return "border-blue-200 bg-blue-50";
      case "orderConfirmation":
        return "border-green-200 bg-green-50";
      case "orderReady":
        return "border-amber-200 bg-amber-50";
      case "orderDelivered":
        return "border-emerald-200 bg-emerald-50";
      case "orderCancelled":
      case "orderCancelledByChef":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border border-neutral-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recent Notifications
          </CardTitle>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllAlerts}
              className="text-xs text-neutral-500 hover:text-neutral-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.slice(0, 10).map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(alert.event)} transition-all hover:shadow-sm`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(alert.event)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900">
                  {getEventTitle(alert.event)}
                </p>
                <button
                  onClick={() => clearAlert(alert.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="h-3 w-3 text-neutral-400" />
                </button>
              </div>
              {alert.orderId && (
                <p className="text-xs font-medium text-neutral-600 mt-1">
                  Order #{getDisplayOrderId(alert.orderId)}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-neutral-400" />
                <span className="text-xs text-neutral-500">
                  {alert.timestamp.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {alerts.length > 10 && (
          <p className="text-xs text-neutral-500 text-center py-2">
            And {alerts.length - 10} more notifications...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;