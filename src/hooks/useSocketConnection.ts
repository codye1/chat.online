import { useState, useEffect, useRef, useCallback } from "react";
import {
  initializeSocketListeners,
  SOCKET_RECONNECTION_DELAY,
  SOCKET_RECONNECTION_DELAY_MAX,
} from "@utils/socket/socket";
import socket from "@utils/socket/socket";

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastReconnectAttemptAt, setLastReconnectAttemptAt] =
    useState<Date | null>(null);
  const [
    secondsUntilNextReconnectAttempt,
    setSecondsUntilNextReconnectAttempt,
  ] = useState<number | null>(null);
  const reconnectCountdownIntervalRef = useRef<number | null>(null);

  const clearReconnectCountdown = useCallback(() => {
    if (reconnectCountdownIntervalRef.current) {
      clearInterval(reconnectCountdownIntervalRef.current);
      reconnectCountdownIntervalRef.current = null;
    }
  }, []);

  const reconnectNow = useCallback(() => {
    setConnectionError(null);
    setSecondsUntilNextReconnectAttempt(null);
    clearReconnectCountdown();
    setReconnectAttempts(1);
    if (socket.connected) {
      return;
    }

    socket.disconnect();
    socket.connect();
  }, [clearReconnectCountdown]);

  useEffect(() => {
    const startReconnectCountdown = (delayMs: number) => {
      clearReconnectCountdown();

      if (!Number.isFinite(delayMs)) {
        setSecondsUntilNextReconnectAttempt(null);
        return;
      }

      const initialSeconds = Math.ceil(delayMs / 1000);
      setSecondsUntilNextReconnectAttempt(initialSeconds);

      if (initialSeconds <= 0) {
        return;
      }

      reconnectCountdownIntervalRef.current = window.setInterval(() => {
        setSecondsUntilNextReconnectAttempt((currentSeconds) => {
          if (currentSeconds === null || currentSeconds <= 1) {
            clearReconnectCountdown();
            return 0;
          }

          return currentSeconds - 1;
        });
      }, 1000);
    };

    const cleanup = initializeSocketListeners({
      onConnect: () => {
        setIsConnected(true);
        setConnectionError(null);
        setSecondsUntilNextReconnectAttempt(null);
        clearReconnectCountdown();
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onConnectError: (error: Error) => {
        setConnectionError(error.message);
      },
      onReconnectAttempt: (attempt: number) => {
        setReconnectAttempts(attempt);
        setLastReconnectAttemptAt(new Date());

        const backoffAttempt = Math.max(attempt - 1, 0);

        const nextReconnectDelay = Math.min(
          SOCKET_RECONNECTION_DELAY * 2 ** backoffAttempt,
          SOCKET_RECONNECTION_DELAY_MAX,
        );

        startReconnectCountdown(nextReconnectDelay);
      },
    });

    return () => {
      cleanup();
      clearReconnectCountdown();
    };
  }, [clearReconnectCountdown]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    lastReconnectAttemptAt,
    secondsUntilNextReconnectAttempt,
    reconnectNow,
  };
};
