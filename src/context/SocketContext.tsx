import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import socketio from "socket.io-client";
import Swal from "sweetalert2";
import { SOCKET_URL, WaiterSocketEventEnum } from "../constant";
import { useAuth } from "../hooks/useAuth";
import { getDisplayOrderId } from "../utils/orderId";

const SocketContext = createContext<{
  socket: ReturnType<typeof socketio> | null;
  connected: boolean;
  alerts: Array<{
    id: string;
    event: string;
    orderId?: string;
    timestamp: Date;
    data: Record<string, unknown>;
  }>;
  clearAlert: (id: string) => void;
  clearAllAlerts: () => void;
}>({
  socket: null,
  connected: false,
  alerts: [],
  clearAlert: () => {},
  clearAllAlerts: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, tenantId } = useAuth();
  const socketRef = useRef<ReturnType<typeof socketio> | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof socketio> | null>(
    null,
  );
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    event: string;
    orderId?: string;
    timestamp: Date;
    data: Record<string, unknown>;
  }>>([]);

  const clearAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const showAlert = (eventName: string, data: Record<string, unknown> = {}) => {
    const orderId = data?.orderId as string;
    const displayOrderId = orderId ? getDisplayOrderId(orderId) : "";
    const timestamp = new Date();
    const alertId = `${eventName}-${orderId || 'general'}-${timestamp.getTime()}`;

    // Add to alerts state
    const alertData = {
      id: alertId,
      event: eventName,
      orderId,
      timestamp,
      data,
    };
    setAlerts(prev => [alertData, ...prev]);

    // Configure SweetAlert based on event type
    let config: any = {
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast',
        title: 'text-sm font-semibold',
        htmlContainer: 'text-xs',
      },
    };

    switch (eventName) {
      case WaiterSocketEventEnum.ORDER_PLACED_EVENT:
        config = {
          ...config,
          icon: 'info',
          iconColor: '#3B82F6',
          title: 'New Order Placed!',
          html: `
            <div class="space-y-1">
              ${orderId ? `<div class="font-medium text-blue-600">Order #${displayOrderId}</div>` : ''}
              <div class="text-gray-600">A new order has been placed</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #EBF4FF 0%, #C7E4FF 100%)',
          color: '#1E40AF',
        };
        break;

      case WaiterSocketEventEnum.ORDER_CONFIRMATION_EVENT:
        config = {
          ...config,
          icon: 'success',
          iconColor: '#10B981',
          title: 'Order Confirmed!',
          html: `
            <div class="space-y-1">
              ${orderId ? `<div class="font-medium text-green-600">Order #${displayOrderId}</div>` : ''}
              <div class="text-gray-600">Order has been confirmed</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          color: '#065F46',
        };
        break;

      case WaiterSocketEventEnum.ORDER_READY_EVENT:
        config = {
          ...config,
          icon: 'warning',
          iconColor: '#F59E0B',
          title: 'Order Ready!',
          html: `
            <div class="space-y-1">
              ${orderId ? `<div class="font-medium text-amber-600">Order #${displayOrderId}</div>` : ''}
              <div class="text-gray-600">Order is ready to serve</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          color: '#92400E',
        };
        break;

      case WaiterSocketEventEnum.ORDER_DELIVERED_EVENT:
        config = {
          ...config,
          icon: 'success',
          iconColor: '#059669',
          title: 'Order Delivered!',
          html: `
            <div class="space-y-1">
              ${orderId ? `<div class="font-medium text-emerald-600">Order #${displayOrderId}</div>` : ''}
              <div class="text-gray-600">Order has been delivered</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)',
          color: '#064E3B',
        };
        break;

      case WaiterSocketEventEnum.ORDER_CANCELLED_EVENT:
      case WaiterSocketEventEnum.ORDER_CANCELLED_BY_CHEF_EVENT:
        config = {
          ...config,
          icon: 'error',
          iconColor: '#EF4444',
          title: eventName === WaiterSocketEventEnum.ORDER_CANCELLED_BY_CHEF_EVENT ? 'Order Cancelled by Chef!' : 'Order Cancelled!',
          html: `
            <div class="space-y-1">
              ${orderId ? `<div class="font-medium text-red-600">Order #${displayOrderId}</div>` : ''}
              <div class="text-gray-600">${eventName === WaiterSocketEventEnum.ORDER_CANCELLED_BY_CHEF_EVENT ? 'Order was cancelled by the chef' : 'Order has been cancelled'}</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
          color: '#991B1B',
        };
        break;

      case WaiterSocketEventEnum.SOCKET_ERROR_EVENT:
        config = {
          ...config,
          icon: 'error',
          iconColor: '#DC2626',
          title: 'Connection Error!',
          html: `
            <div class="space-y-1">
              <div class="text-gray-600">Socket connection error occurred</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
          color: '#7F1D1D',
        };
        break;

      default:
        config = {
          ...config,
          icon: 'info',
          title: 'Notification',
          html: `
            <div class="space-y-1">
              <div class="text-gray-600">${eventName}</div>
              <div class="text-xs text-gray-500 mt-2">${timestamp.toLocaleTimeString()}</div>
            </div>
          `,
        };
    }

    Swal.fire(config);
  };

  const buildAlertMessage = (eventName: string, data: Record<string, unknown>) => {
    const orderId = data?.orderId
      ? `Order: ${getDisplayOrderId(String(data.orderId))}`
      : null;
    const confirmedBy = data?.confirmedBy
      ? `Confirmed by: ${String(data.confirmedBy)}`
      : null;
    const cancelledBy = data?.cancelledBy
      ? `Cancelled by: ${String(data.cancelledBy)}`
      : null;

    return [
      `Socket event: ${eventName}`,
      orderId,
      confirmedBy,
      cancelledBy,
      `Payload: ${JSON.stringify(data)}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  useEffect(() => {
    // No token or tenantId — disconnect any existing socket and bail
    if (!token || !tenantId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Already have a live connection with the same credentials
    if (socketRef.current?.connected) return;

    const s = socketio(SOCKET_URL, {
      withCredentials: false,
      auth: { token },
      extraHeaders: {
        "x-tenant-id": tenantId ?? "",
      },
    });

    socketRef.current = s;

    s.on("connect", () => {
      setSocket(s);
      setConnected(true);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("connect_error", (err) => {
      console.error("[Socket] connection error:", err.message);
    });

    s.on(WaiterSocketEventEnum.ORDER_PLACED_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_PLACED_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_PLACED_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.ORDER_CONFIRMATION_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_CONFIRMATION_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_CONFIRMATION_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.ORDER_READY_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_READY_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_READY_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.ORDER_DELIVERED_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_DELIVERED_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_DELIVERED_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.ORDER_CANCELLED_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_CANCELLED_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_CANCELLED_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.ORDER_CANCELLED_BY_CHEF_EVENT, (data: Record<string, unknown> = {}) => {
      console.log("[Socket] ORDER_CANCELLED_BY_CHEF_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.ORDER_CANCELLED_BY_CHEF_EVENT, data);
    });

    s.on(WaiterSocketEventEnum.SOCKET_ERROR_EVENT, (data) => {
      console.error("[Socket] SOCKET_ERROR_EVENT data:", data);
      showAlert(WaiterSocketEventEnum.SOCKET_ERROR_EVENT, data);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token, tenantId]);

  return (
    <SocketContext.Provider value={{ socket, connected, alerts, clearAlert, clearAllAlerts }}>
      {children}
    </SocketContext.Provider>
  );
};
