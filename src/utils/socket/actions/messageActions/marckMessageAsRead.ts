import {
  updateConversation,
  updateConversationsState,
} from "@api/slices/helpers/ConversationsManage";
import socket from "@utils/socket/socket";

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

  updateConversationsState((draft) => {
    const convo = draft.byId[conversationId];
    if (convo) {
      convo.unreadMessages = Math.max(0, convo.unreadMessages - 1);
    }
  });

  updateConversation(conversationId, (conversation) => {
    if (conversation) {
      conversation.unreadMessages = Math.max(
        0,
        conversation.unreadMessages - 1,
      );
      conversation.lastReadId = lastReadMessageId;
    }
  });
};

export default markMessageAsRead;
