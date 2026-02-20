import { useState, useEffect } from "react";
import { initializeSocketListeners } from "@utils/socket";
import socket from "@utils/socket";

export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initializeSocketListeners({
      onConnect: () => {
        setIsConnected(true);
        setConnectionError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onConnectError: (error: Error) => {
        setConnectionError(error.message);
      },
    });

    return cleanup;
  }, []);

  return { isConnected, connectionError };
};
