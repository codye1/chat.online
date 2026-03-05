import { io, Socket } from "socket.io-client";
import store from "@redux/store";
import chatSlice from "@api/slices/chatSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const socket: Socket = io(API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem("token") || undefined,
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

const syncSocketAuthorizationFromStorage = () => {
  const token = localStorage.getItem("token") || undefined;

  socket.auth = token ? { token } : {};
};

const setSocketAuthorization = (token?: string | null) => {
  socket.auth = token ? { token } : {};
};

const sendMessage = ({
  conversationId,
  text,
  replyToMessageId,
}: {
  conversationId: string;
  text: string;
  replyToMessageId?: string | null;
}) => {
  if (text.length === 0) return;
  const isTemp = conversationId?.startsWith("tempId");

  if (isTemp) {
    const recipientId = conversationId.split(":")[1];
    socket.emit("message:send", {
      text,
      replyToMessageId,
      recipientId,
    });
  }

  if (!isTemp) {
    socket.emit("message:send", {
      conversationId,
      text,
      replyToMessageId,
    });
  }
};

const connectToConversation = (conversationId: string[] | null) => {
  socket.emit("conversation:join", { conversationId });
};

// i use @id @default(cuid()) so message ids are strings and sortable
const emitMessageReadDebounced = (() => {
  const timeouts: Record<string, number | undefined> = {};
  const maxIds: Record<string, string> = {};

  return (conversationId: string, lastReadMessageId: string) => {
    if (!maxIds[conversationId] || lastReadMessageId > maxIds[conversationId]) {
      maxIds[conversationId] = lastReadMessageId;
    }

    if (timeouts[conversationId]) {
      clearTimeout(timeouts[conversationId]);
    }

    timeouts[conversationId] = window.setTimeout(() => {
      const maxId = maxIds[conversationId];
      socket.emit("message:read", { conversationId, lastReadMessageId: maxId });

      delete maxIds[conversationId];
      delete timeouts[conversationId];
    }, 500);
  };
})();

const markMessageAsRead = (
  conversationId: string,
  lastReadMessageId: string,
) => {
  emitMessageReadDebounced(conversationId, lastReadMessageId);

  store.dispatch(
    chatSlice.util.updateQueryData("getConversations", undefined, (draft) => {
      const convo = draft.find((c) => c.id === conversationId);
      if (convo) {
        convo.unreadMessages = Math.max(0, convo.unreadMessages - 1);
      }
    }),
  );

  store.dispatch(
    chatSlice.util.updateQueryData(
      "getConversation",
      { conversationId, recipientId: null },
      (draft) => {
        draft.unreadMessages = Math.max(0, draft.unreadMessages - 1);
        draft.lastReadId = lastReadMessageId;
      },
    ),
  );
};

const addReaction = ({
  messageId,
  content,
}: {
  messageId: string;
  content: string;
}) => {
  socket.emit("reaction:add", { messageId, content });
};

const removeReaction = ({ messageId }: { messageId: string }) => {
  socket.emit("reaction:remove", { messageId });
};

const deleteMessage = (messageId: string) => {
  socket.emit("message:delete", { messageId });
};

const editMessage = ({
  messageId,
  conversationId,
  newText,
}: {
  messageId: string;
  conversationId: string;
  newText: string;
}) => {
  socket.emit("message:edit", { messageId, conversationId, newText });
};

interface SocketListenerCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConnectError?: (error: Error) => void;
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
    const conversations =
      chatSlice.endpoints.getConversations.select(undefined)(state)?.data;

    const conversationsIds = conversations?.map((c) => c.id) || [];

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
  setSocketAuthorization,
  sendMessage,
  deleteMessage,
  editMessage,
  connectToConversation,
  markMessageAsRead,
  addReaction,
  removeReaction,
  initializeSocketListeners,
  syncSocketAuthorizationFromStorage,
};
