"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  onMessage?: MessageHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttempts = useRef(0);
  const handlersRef = useRef(options);
  handlersRef.current = options;

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const baseUrl = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
      .replace(/^http/, "ws")
      .replace(/\/api\/v1$/, "");

    try {
      const ws = new WebSocket(`${baseUrl}/ws/user/?token=${token}`);

      let heartbeatInterval: ReturnType<typeof setInterval>;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
        handlersRef.current.onConnect?.();
        // Heartbeat every 30s to keep connection alive
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: "pong", request_id: crypto.randomUUID() }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handlersRef.current.onMessage?.(data);
        } catch {}
      };

      ws.onclose = () => {
        clearInterval(heartbeatInterval);
        setConnected(false);
        wsRef.current = null;
        handlersRef.current.onDisconnect?.();
        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
      wsRef.current = ws;
    } catch {}
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((action: string, data: Record<string, any> = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    const requestId = crypto.randomUUID();
    wsRef.current.send(JSON.stringify({ action, request_id: requestId, ...data }));
    return requestId;
  }, []);

  return { connected, send };
}
