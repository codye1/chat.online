import store from "@redux/store";
import chatSlice from "../Chat/chatSlice";
import type { MessagesResponse } from "../Chat/endpoints/messageEndpoints";
import type { MessageMedia } from "@utils/types";
import { updateConversationsState } from "./ConversationsManage";

const updateMessages = (
  conversationId: string,
  updateFn: (messages: MessagesResponse) => void,
) => {
  store.dispatch(
    chatSlice.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft) => {
        updateFn(draft);
      },
    ),
  );
};

interface OptimisticMessage {
  conversationId: string;
  text: string;
  replyToMessageId?: string | null;
  media?: MessageMedia[];
}

const addOptimisticMessage = ({
  conversationId,
  text,
  replyToMessageId,
  media,
}: OptimisticMessage) => {
  const tempId = `tempMessageId:${Date.now()}`;

  updateConversationsState((draft) => {
    const convo = draft.byId[conversationId];
    if (convo) {
      convo.lastMessage = {
        id: tempId,
        text,
        createdAt: new Date().toISOString(),
      };
    }
  });

  updateMessages(conversationId, (messages) => {
    const replyMessage = messages.items.find((m) => m.id === replyToMessageId);
    const state = store.getState();
    const currentUser = state.auth.user;
    messages.fromUser = true;
    messages.items.push({
      id: tempId,
      text,
      conversationId,
      replyTo: replyMessage,
      media: media ?? undefined,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      status: "sending",
      reactions: {},
    });
  });

  return tempId;
};

export { updateMessages, addOptimisticMessage };
