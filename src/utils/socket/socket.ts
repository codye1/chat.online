import { io, Socket } from "socket.io-client";
import store from "@redux/store";
import chatSlice from "@api/slices/Chat/chatSlice";
import connectToConversation from "./actions/conversationActions/connectToConversation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const SOCKET_RECONNECTION_ATTEMPTS = 10;
const SOCKET_RECONNECTION_DELAY = 1000;
const SOCKET_RECONNECTION_DELAY_MAX = 30000;

const socket: Socket = io(API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem("token") || undefined,
  },
  reconnection: true,
  reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
  reconnectionDelay: SOCKET_RECONNECTION_DELAY,
  reconnectionDelayMax: SOCKET_RECONNECTION_DELAY_MAX,
  randomizationFactor: 0,
  timeout: 20000,
});

const syncSocketAuthorizationFromStorage = () => {
  const token = localStorage.getItem("token") || undefined;

  socket.auth = token ? { token } : {};
};

const setSocketAuthorization = (token?: string | null) => {
  socket.auth = token ? { token } : {};
};

interface SocketListenerCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConnectError?: (error: Error) => void;
  onReconnectAttempt?: (attempt: number) => void;
}

let pingInterval: number | null = null;

const initializeSocketListeners = (
  callbacks?: SocketListenerCallbacks,
): (() => void) => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  const onConnectError = (error: Error) => {
    console.error("Socket connection error:", error.message);

    if (
      error.message.includes("auth") ||
      error.message.includes("unauthorized")
    ) {
      console.log("Auth error detected, syncing token from storage");
      syncSocketAuthorizationFromStorage();
    }

    callbacks?.onConnectError?.(error);
  };

  const onDisconnect = (reason: string) => {
    console.log("Socket disconnected. Reason:", reason);

    if (reason === "io server disconnect") {
      console.log(
        "Server disconnected socket. Syncing token and reconnecting...",
      );
      syncSocketAuthorizationFromStorage();
      socket.connect();
    }

    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    callbacks?.onDisconnect?.();
  };

  const onConnect = () => {
    console.log("Socket connected successfully");

    const state = store.getState();
    const conversationsState =
      chatSlice.endpoints.getConversations.select(undefined)(state)?.data;
    let conversationsIds: string[] = [];

    if (conversationsState) {
      conversationsIds = [
        ...conversationsState.activeIds.pinned,
        ...conversationsState.activeIds.unpinned,
        ...conversationsState.archivedIds.pinned,
        ...conversationsState.archivedIds.unpinned,
      ];
    }

    if (conversationsIds.length > 0) {
      connectToConversation(conversationsIds);
    }

    if (pingInterval) {
      clearInterval(pingInterval);
    }
    pingInterval = window.setInterval(() => {
      socket.emit("lastSeenAt:update");
    }, 1000 * 50);

    callbacks?.onConnect?.();
  };

  const onReconnectAttempt = (attempt: number) => {
    console.log(`Reconnection attempt ${attempt}`);
    syncSocketAuthorizationFromStorage();
    callbacks?.onReconnectAttempt?.(attempt);
  };

  const onReconnectFailed = () => {
    console.error("Socket reconnection failed after all attempts");
  };

  const onReconnect = (attempt: number) => {
    console.log(`Socket reconnected successfully after ${attempt} attempts`);
  };

  socket.on("connect_error", onConnectError);
  socket.on("disconnect", onDisconnect);
  socket.on("connect", onConnect);
  socket.io.on("reconnect_attempt", onReconnectAttempt);
  socket.io.on("reconnect_failed", onReconnectFailed);
  socket.io.on("reconnect", onReconnect);

  return () => {
    socket.off("connect_error", onConnectError);
    socket.off("disconnect", onDisconnect);
    socket.off("connect", onConnect);
    socket.io.off("reconnect_attempt", onReconnectAttempt);
    socket.io.off("reconnect_failed", onReconnectFailed);
    socket.io.off("reconnect", onReconnect);

    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };
};

export default socket;
export {
  SOCKET_RECONNECTION_ATTEMPTS,
  SOCKET_RECONNECTION_DELAY,
  SOCKET_RECONNECTION_DELAY_MAX,
  setSocketAuthorization,
  initializeSocketListeners,
  syncSocketAuthorizationFromStorage,
};
