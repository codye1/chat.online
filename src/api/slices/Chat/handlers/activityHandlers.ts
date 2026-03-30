import {
  updateConversation,
  updateConversationsState,
} from "@api/slices/helpers/ConversationsManage";
import type { RootState } from "@redux/store";
import store from "@redux/store";

const onUserActive = ({
  conversationId,
  nickname,
  reason,
}: {
  conversationId: string;
  nickname: string;
  reason: "typing" | "editing";
}) => {
  const { getState } = store;
  const state = getState() as RootState;
  const user = state.auth.user;

  if (nickname === user.nickname) {
    return;
  }
  updateConversationsState((draft) => {
    const convo = draft.byId[conversationId];
    if (convo) {
      convo.activeUsers = convo.activeUsers || [];
      const isAlreadyActive = convo.activeUsers.find(
        (u) => u.nickname === nickname,
      );
      if (isAlreadyActive) return;
      convo.activeUsers.push({ nickname, reason });
    }
  });

  updateConversation(conversationId, (conversation) => {
    if (conversation) {
      conversation.activeUsers = conversation.activeUsers || [];
      if (!conversation.activeUsers.find((u) => u.nickname === nickname)) {
        conversation.activeUsers.push({ nickname, reason });
      }
    }
  });
};

const onUserStopActive = ({
  conversationId,
  nickname,
}: {
  conversationId: string;
  nickname: string;
}) => {
  const { getState } = store;
  const state = getState() as RootState;
  const user = state.auth.user;

  if (nickname === user.nickname) {
    return;
  }

  updateConversationsState((draft) => {
    const convo = draft.byId[conversationId];
    if (convo && convo.activeUsers) {
      convo.activeUsers = convo.activeUsers.filter(
        (u) => u.nickname !== nickname,
      );
    }
  });
  updateConversation(conversationId, (conversation) => {
    if (conversation && conversation.activeUsers) {
      conversation.activeUsers = conversation.activeUsers.filter(
        (id) => id.nickname !== nickname,
      );
    }
  });
};

export { onUserActive, onUserStopActive };
