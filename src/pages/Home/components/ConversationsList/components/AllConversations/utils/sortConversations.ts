import type { ConversationPreview } from "@utils/types";

const sortConversations = (
  conversations: Record<string, ConversationPreview>,
) => {
  return Object.values(conversations).toSorted((a, b) => {
    const aTime = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : new Date(a.createdAt).getTime();
    const bTime = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
};

export default sortConversations;
