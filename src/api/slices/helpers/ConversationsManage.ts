import store from "@redux/store";
import chatSlice from "../chatSlice";
import type {
  ConversationsState,
  EditableConversationFields,
} from "@utils/types";

const updateConversationsState = (
  updateFn: (state: ConversationsState) => void,
) => {
  store.dispatch(
    chatSlice.util.updateQueryData("getConversations", undefined, (draft) => {
      updateFn(draft);
    }),
  );
};

const getConversationsCache = () => {
  const state = store.getState();
  return chatSlice.endpoints.getConversations.select()(state).data;
};

const updatePinnedPositions = async (
  folderId: string,
  updates: { conversationId: string; newPinnedPosition: number | null }[],
) => {
  updateConversationsState((state) => {
    let pinned: string[] | undefined;
    let unpinned: string[] | undefined;

    switch (folderId) {
      case "ACTIVE":
        pinned = state.activeIds.pinned;
        unpinned = state.activeIds.unpinned;
        break;
      case "ARCHIVED":
        pinned = state.archivedIds.pinned;
        unpinned = state.archivedIds.unpinned;
        break;
      default: {
        const folder = state.folders.find((f) => f.id === folderId);
        if (folder) {
          pinned = folder.pinnedConversationIds;
          unpinned = folder.unpinnedConversationIds;
        }
        break;
      }
    }

    if (!pinned || !unpinned) return;

    updates.forEach(({ conversationId, newPinnedPosition }) => {
      const id = conversationId;

      if (pinned.includes(id)) {
        const idx = pinned.indexOf(id);
        pinned.splice(idx, 1);
        if (newPinnedPosition == null) {
          unpinned.unshift(id);
        } else {
          pinned.splice(newPinnedPosition, 0, id);
        }
      } else {
        const idx = unpinned.indexOf(id);
        if (idx !== -1) unpinned.splice(idx, 1);
        pinned.unshift(id);
      }
    });
  });

  await store
    .dispatch(
      chatSlice.endpoints.updatePinnedPosition.initiate({ folderId, updates }),
    )
    .unwrap();
};

const updateConversationSettings = async (
  conversationId: string,
  settings: EditableConversationFields,
) => {
  updateConversationsState((state) => {
    const conversation = state.byId[conversationId];
    if (conversation) {
      Object.assign(conversation, settings);
    }

    if (settings.isArchived === true) {
      state.activeIds.pinned = state.activeIds.pinned.filter(
        (id) => id !== conversationId,
      );
      state.activeIds.unpinned = state.activeIds.unpinned.filter(
        (id) => id !== conversationId,
      );

      state.archivedIds.unpinned.unshift(conversationId);
    }

    if (settings.isArchived === false) {
      state.archivedIds.pinned = state.archivedIds.pinned.filter(
        (id) => id !== conversationId,
      );
      state.archivedIds.unpinned = state.archivedIds.unpinned.filter(
        (id) => id !== conversationId,
      );
      state.activeIds.unpinned.unshift(conversationId);
    }
  });

  await store
    .dispatch(
      chatSlice.endpoints.updateConversationSettings.initiate({
        conversationId,
        settings,
      }),
    )
    .unwrap();
};

const addToFolder = async (conversationId: string, folderId: string) => {
  updateConversationsState((state) => {
    const folder = state.folders.find((f) => f.id === folderId);
    if (folder) {
      if (!folder.unpinnedConversationIds.includes(conversationId)) {
        folder.unpinnedConversationIds.unshift(conversationId);
      }
    }
  });
  await store
    .dispatch(
      chatSlice.endpoints.addConversationToFolder.initiate({
        conversationId,
        folderId,
      }),
    )
    .unwrap();
};

const removeFromFolder = async (conversationId: string, folderId: string) => {
  updateConversationsState((state) => {
    const folder = state.folders.find((f) => f.id === folderId);
    if (folder) {
      folder.pinnedConversationIds = folder.pinnedConversationIds.filter(
        (id) => id !== conversationId,
      );
      folder.unpinnedConversationIds = folder.unpinnedConversationIds.filter(
        (id) => id !== conversationId,
      );
    }
  });
  await store
    .dispatch(
      chatSlice.endpoints.removeConversationFromFolder.initiate({
        conversationId,
        folderId,
      }),
    )
    .unwrap();
};

export {
  updateConversationsState,
  getConversationsCache,
  updatePinnedPositions,
  updateConversationSettings,
  addToFolder,
  removeFromFolder,
};
