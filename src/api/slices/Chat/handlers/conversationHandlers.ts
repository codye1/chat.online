import {
  deleteConversationFromState,
  updateConversation,
  updateConversationsState,
  upsertConversation,
} from "@api/slices/helpers/ConversationsManage";
import { setConversation } from "@redux/global";
import type { RootState } from "@redux/store";
import store from "@redux/store";
import connectToConversation from "@utils/socket/actions/conversationActions/connectToConversation";
import type { Conversation, Message } from "@utils/types";
import { upsertMessages } from "./messageHandlers";

interface onLastSeenAtUpdateData {
  userId: string;
  lastSeenAt: string;
}

const onLastSeenAtUpdate = (data: onLastSeenAtUpdateData) => {
  const { userId, lastSeenAt } = data;

  const state = store.getState() as RootState;
  const conversationId = state.global.conversationId;
  if (!conversationId) return;

  updateConversation(conversationId, (conversation) => {
    if (
      conversation.type === "DIRECT" &&
      conversation.otherParticipant.id === userId
    ) {
      conversation.lastSeenAt = lastSeenAt;
    }
  });
};

interface CreateOnUpdateConversationData {
  conversation: Conversation;
  recipientId: string;
}

const createOnUpdateConversation = (data: CreateOnUpdateConversationData) => {
  const { conversation, recipientId } = data;

  const { dispatch, getState } = store;
  const state = getState() as RootState;

  const globalRecipientId = state.global.recipientId;

  if (globalRecipientId == recipientId) {
    dispatch(setConversation({ conversationId: conversation.id }));
  }

  updateConversation(conversation.id, () => conversation);

  // Update conversations list cache
  updateConversationsState((draft) => {
    draft.byId[conversation.id] = conversation;
  });
};
interface CreateOnLastSeenAtUpdateData {
  conversation: Conversation;
  initiator: string;
  recipientId?: string;
  firstMessage?: Message;
}

const onNewConversation = (data: CreateOnLastSeenAtUpdateData) => {
  const { conversation, recipientId, initiator, firstMessage } = data;
  const { dispatch, getState } = store;

  connectToConversation([conversation.id]);
  updateConversationsState((draft) => {
    draft.byId[conversation.id] = conversation;
    draft.activeIds.unpinned.unshift(conversation.id);
  });
  upsertConversation(conversation);
  upsertMessages(conversation.id, {
    items: firstMessage ? [firstMessage] : [],
    hasMoreUp: false,
    hasMoreDown: false,
    fromUser: false,
  });

  const state = getState() as RootState;
  const isTempSelected = state.global.conversationId?.startsWith("tempId");
  const tempId = state.global.conversationId?.split(":")[1];
  if (isTempSelected && (tempId === recipientId || tempId === initiator)) {
    dispatch(setConversation({ conversationId: conversation.id }));
  }
};

const onDeleteConversation = (data: {
  conversationId: string;
  initiatorId?: string;
}) => {
  const { conversationId, initiatorId } = data;
  const state = store.getState() as RootState;
  const userId = state.auth.user.id;
  if (initiatorId == userId) return;

  deleteConversationFromState({ conversationId });
};

export {
  onLastSeenAtUpdate,
  createOnUpdateConversation,
  onNewConversation,
  onDeleteConversation,
};
