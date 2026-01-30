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
  conversationId: string | null,
  oldConversationId: string | null,
) => {
  socket.emit("conversation:join", { conversationId, oldConversationId });
};

export const markMessageAsRead = (
  conversationId: string,
  messageId: string,
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
        const msg = draft.find((m) => m.id === messageId);
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
};

export default socket;
