import { io, Socket } from "socket.io-client";
import store from "@redux/store";
import chatSlice from "@api/slices/chatSclice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const socket: Socket = io(API_BASE_URL, {
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

export const syncSocketAuthorizationFromStorage = () => {
  const token = localStorage.getItem("token") || undefined;

  socket.auth = token ? { token } : {};
};

export const setSocketAuthorization = (token?: string | null) => {
  socket.auth = token ? { token } : {};
};

export const sendMessage = ({
  conversationId,
  recipientId,
  text,
}: {
  conversationId: string | null;
  recipientId: string | null;
  text: string;
}) => {
  socket.emit("message:send", {
    conversationId,
    recipientId,
    text,
  });
};

export const connectToConversation = (
  conversationId: string[] | null,
  oldConversationId: string | null,
) => {
  socket.emit("conversation:join", { conversationId, oldConversationId });
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
      console.log("last read " + maxId);
      socket.emit("message:read", { conversationId, lastReadMessageId: maxId });

      delete maxIds[conversationId];
      delete timeouts[conversationId];
    }, 500);
  };
})();

export const markMessageAsRead = (
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
      },
    ),
  );
};

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);

  if (
    error.message.includes("auth") ||
    error.message.includes("unauthorized")
  ) {
    console.log("Auth error detected, syncing token from storage");
    syncSocketAuthorizationFromStorage();
  }
});

let pingInterval: number | null = null;

socket.on("disconnect", (reason) => {
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
});

socket.on("connect", () => {
  console.log("Socket connected successfully");

  const state = store.getState();
  const conversations =
    chatSlice.endpoints.getConversations.select(undefined)(state)?.data;

  const conversationsIds = conversations?.map((c) => c.id) || [];

  if (conversationsIds.length > 0) {
    connectToConversation(conversationsIds, null);
  }

  if (pingInterval) {
    clearInterval(pingInterval);
  }
  pingInterval = window.setInterval(() => {
    socket.emit("lastSeenAt:update");
  }, 1000 * 50);
});

socket.io.on("reconnect_attempt", (attempt) => {
  console.log(`Reconnection attempt ${attempt}`);
  syncSocketAuthorizationFromStorage();
});

socket.io.on("reconnect_failed", () => {
  console.error("Socket reconnection failed after all attempts");
});

socket.io.on("reconnect", (attempt) => {
  console.log(`Socket reconnected successfully after ${attempt} attempts`);
});

export default socket;
