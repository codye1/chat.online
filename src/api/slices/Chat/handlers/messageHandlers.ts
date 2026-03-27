import type { RootState } from "@redux/store";
import store from "@redux/store";
import type { Message } from "@utils/types";
import chatSlice from "../chatSlice";
import {
  getConversationsState,
  updateConversation,
  updateConversationsState,
} from "@api/slices/helpers/ConversationsManage";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import type { MessagesResponse } from "../endpoints/messageEndpoints";

const onNewMessage = (message: Message) => {
  const { getState } = store;
  console.log(message);

  const state = getState() as RootState;
  const conversationId = state.global.conversationId;
  const conversationsState = getConversationsState();

  const conversation = conversationsState?.byId[message.conversationId];

  if (!conversation) {
    chatSlice.endpoints.getConversations.initiate({
      ids: [message.conversationId],
    });
    return;
  }
  updateConversationsState((draft) => {
    const convo = draft.byId[message.conversationId];

    if (convo) {
      convo.lastMessage = message;

      if (state.auth.user.id !== message.sender.id) {
        convo.unreadMessages += 1;
      }
    }
  });

  updateConversation(message.conversationId, (conversation) => {
    if (conversation) {
      conversation.lastMessage = message;
      if (state.auth.user.id !== message.sender.id) {
        conversation.unreadMessages += 1;
      }
    }
  });

  if (conversationId !== message.conversationId) {
    updateMessages(message.conversationId, (messages) => {
      messages.hasMoreDown = true;
    });
    return;
  }
  updateMessages(message.conversationId, (messages) => {
    if (!messages.hasMoreDown) {
      messages.items.push(message);
      messages.fromUser = message.sender.id === state.auth.user.id;
    }
  });
};

const onSentMessage = (data: { tempId: string; message: Message }) => {
  const { tempId, message } = data;
  console.log(tempId);

  updateMessages(message.conversationId, (messages) => {
    const index = messages.items.findIndex((m) => m.id === tempId);
    if (index !== -1) {
      Object.assign(messages.items[index], message, { status: "sent" });
    }
  });
};

interface onMessageReadData {
  lastReadMessage: {
    id: string;
    senderId: string;
  };
  conversationId: string;
}

const onMessageRead = (data: onMessageReadData) => {
  const { lastReadMessage, conversationId } = data;
  console.log(lastReadMessage);

  updateConversation(conversationId, (conversation) => {
    if (conversation) {
      conversation.lastReadIdByParticipants = lastReadMessage.id;
    }
  });
};

const onMessageEdited = (editedMessage: Message) => {
  updateMessages(editedMessage.conversationId, (messages) => {
    if (messages.items) {
      const messageIndex = messages.items.findIndex(
        (m) => m.id === editedMessage.id,
      );
      if (messageIndex !== -1) {
        messages.items[messageIndex] = editedMessage;
      }
    }
  });
  updateConversationsState((draft) => {
    const convo = draft.byId[editedMessage.conversationId];
    if (convo && convo.lastMessage?.id === editedMessage.id) {
      convo.lastMessage = editedMessage;
    }
  });
};

interface onDeleteMessageData {
  conversationId: string;
  messageId: string;
}

const onDeleteMessage = (data: onDeleteMessageData) => {
  const { conversationId, messageId } = data;

  let lastMessageSnapshot: {
    text: string;
    createdAt: string;
    id: string;
  } | null = null;

  updateMessages(conversationId, (messages) => {
    if (messages && messages.items) {
      messages.items = messages.items.filter((m) => m.id !== messageId);
      const last = messages.items[messages.items.length - 1];
      if (last) {
        lastMessageSnapshot = {
          text: last.text,
          createdAt: last.createdAt,
          id: last.id,
        };
      }
    }
  });

  updateConversation(conversationId, (conversation) => {
    if (conversation) {
      conversation.lastMessage = lastMessageSnapshot;
    }
  });

  updateConversationsState((draft) => {
    const convo = draft.byId[conversationId];
    if (convo) {
      convo.lastMessage = lastMessageSnapshot;
    }
  });
};

const upsertMessages = (conversationId: string, messages: MessagesResponse) => {
  store.dispatch(
    chatSlice.util.upsertQueryData("getMessages", { conversationId }, messages),
  );
};

export {
  onNewMessage,
  onSentMessage,
  onMessageRead,
  onMessageEdited,
  onDeleteMessage,
  upsertMessages,
};
