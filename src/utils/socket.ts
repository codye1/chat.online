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
        convo.unreadMessages -= 1;
      }
    }),
  );

  store.dispatch(
    chatSlice.util.updateQueryData(
      "getConversation",
      { conversationId, recipientId: null },
      (draft) => {
        draft.unreadMessages -= 1;
      },
    ),
  );
};

socket.on("connection:disconnected", () => {
  console.log("Disconnected from socket server");
});

socket.on("connection:connected", () => {
  console.log("Connected to socket server");
});

export default socket;
