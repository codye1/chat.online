import type { ConversationPreview } from "@utils/types";

const sortConversations = (
  conversations: Record<string, ConversationPreview>,
) => {
  return Object.values(conversations).toSorted((a, b) => {
    const aTime = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });
};

export default sortConversations;
