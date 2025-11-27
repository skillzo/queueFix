import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../utils/constants";

export interface QueueUpdate {
  type: "JOINED" | "JOINED_MANY" | "NEXT_SERVED" | "LEFT";
  queueSize: number;
  servingNumber?: number;
  entry?: {
    id: string;
    queueNumber: string;
    fullName: string;
    position?: number;
  };
  entries?: Array<{
    id: string;
    queueNumber: string;
    fullName: string;
    position: number;
  }>;
  count?: number;
}

interface UseQueueSocketOptions {
  companyId: string | undefined;
  onUpdate: (data: QueueUpdate) => void;
  enabled?: boolean;
}

export function useQueueSocket({
  companyId,
  onUpdate,
  enabled = true,
}: UseQueueSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep callback ref updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!companyId || !enabled) {
      return;
    }

    // Extract base URL from API_BASE_URL (remove /api/v1)
    const baseUrl = API_BASE_URL.replace("/api/v1", "");

    // Connect to WebSocket server
    const socket = io(baseUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      // Join the company's queue room
      socket.emit("join-queue-room", companyId);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("WebSocket reconnected after", attemptNumber, "attempts");
      socket.emit("join-queue-room", companyId);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    // Listen for queue updates
    socket.on("queue-updated", (data: QueueUpdate) => {
      console.log("Queue update received:", data);
      onUpdateRef.current(data);
    });

    // Cleanup on unmount or when companyId changes
    return () => {
      if (socket.connected) {
        socket.emit("leave-queue-room", companyId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [companyId, enabled]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const isConnected = socketRef.current?.connected ?? false;

  return {
    isConnected,
    disconnect,
  };
}
