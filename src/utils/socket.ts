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
  userId: string,
) => {
  // Update messages cache to mark message as read
  // unreadMessagesCount because with convo.unreadMessages = convo.unreadMessages - 1 it sometimes goes more than was readed

  let unreadMessagesCount = 0;
  store.dispatch(
    chatSlice.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft) => {
        const msg = draft.find((m) => m.id === lastReadMessageId);
        if (msg) msg.read = true;
        unreadMessagesCount = draft.filter(
          (m) => !m.read && m.senderId !== userId,
        ).length;
      },
    ),
  );

  store.dispatch(
    chatSlice.util.updateQueryData("getConversations", undefined, (draft) => {
      const convo = draft.find((c) => c.id === conversationId);
      if (convo) {
        convo.unreadMessages = unreadMessagesCount;
      }
    }),
  );

  emitMessageReadDebounced(conversationId, lastReadMessageId);
};

export default socket;
