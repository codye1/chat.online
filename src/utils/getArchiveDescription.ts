import type { ConversationsState } from "./types";

const getArchiveDescription = (conversationsState: ConversationsState) => {
  const archivedConversationIds = [
    ...conversationsState.archivedIds.pinned,
    ...conversationsState.archivedIds.unpinned,
  ];

  const archivedConversations = archivedConversationIds
    .map((id) => conversationsState.byId[id])
    .filter((conversation) => Boolean(conversation))
    .toSorted((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((conversation) => conversation.title);

  return archivedConversations.length > 0
    ? archivedConversations.join(", ")
    : "Conversations you've archived";
};

export default getArchiveDescription;
