import {
  updateConversation,
  updateConversationsState,
} from "@api/slices/helpers/ConversationsManage";
const resetUnreadMessagesCount = (conversationId: string) => {
  updateConversationsState((state) => {
    const convo = state.byId[conversationId];
    if (convo) {
      convo.unreadMessages = 0;
    }
  });
  updateConversation(conversationId, (conversation) => {
    conversation.unreadMessages = 0;
  });
};

export default resetUnreadMessagesCount;
