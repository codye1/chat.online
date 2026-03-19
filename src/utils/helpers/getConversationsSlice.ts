import type { ConversationPreview, ConversationsState } from "@utils/types";

interface IGetConversationsSlice {
  activeFolderId: string;
  conversationsState: ConversationsState;
  take: number;
}

const getConversationsSlice = ({
  activeFolderId,
  conversationsState,
  take,
}: IGetConversationsSlice) => {
  let pinned: string[];
  let unpinned: string[];

  switch (activeFolderId) {
    case "ACTIVE":
      pinned = conversationsState.activeIds.pinned;
      unpinned = conversationsState.activeIds.unpinned;
      break;
    case "ARCHIVED":
      pinned = conversationsState.archivedIds.pinned;
      unpinned = conversationsState.archivedIds.unpinned;
      break;
    default: {
      const folder = conversationsState.folders.find(
        (f) => f.id === activeFolderId,
      );
      pinned = folder?.pinnedConversationIds ?? [];
      unpinned = folder?.unpinnedConversationIds ?? [];
    }
  }

  const missing: string[] = [];
  const pinnedConversations: Record<string, ConversationPreview> = {};
  let took = 0;

  for (const id of pinned) {
    if (took >= take) break;
    const conversation = conversationsState.byId[id];
    if (conversation) {
      pinnedConversations[id] = conversation;
    } else {
      missing.push(id);
    }
    took++;
  }

  const unpinnedConversations: Record<string, ConversationPreview> = {};

  for (const id of unpinned) {
    if (took >= take) break;
    const conversation = conversationsState.byId[id];
    if (conversation) {
      unpinnedConversations[id] = conversation;
    } else {
      missing.push(id);
    }
    took++;
  }

  const hasMore = took < pinned.length + unpinned.length;
  return {
    pinnedConversations,
    unpinnedConversations,
    missing,
    hasMore,
  };
};

export default getConversationsSlice;
