import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import socketio from "socket.io-client";
import { useAuth } from "./AuthContext";
import { SOCKET_URL, WaiterSocketEventEnum } from "../constant";

const SocketContext = createContext<{
  socket: ReturnType<typeof socketio> | null;
  connected: boolean;
}>({
  socket: null,
  connected: false,
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
      withCredentials: true,
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

    s.on(WaiterSocketEventEnum.ORDER_PLACED_EVENT, (data) => {
      console.log("[Socket] ORDER_PLACED_EVENT data:", data);
      alert("Order Placed");
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token, tenantId]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
