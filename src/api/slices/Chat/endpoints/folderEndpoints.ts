import type { Folder } from "@utils/types";
import type { Builder } from "../chatSlice";
import { updateConversationsState } from "@api/slices/helpers/ConversationsManage";

const buildFolderEndpoints = (builder: Builder) => ({
  createFolder: builder.mutation<
    Folder,
    { title: string; position: number; conversations?: string[] }
  >({
    query: ({ title, conversations, position }) => ({
      url: `chat/folders`,
      method: "POST",
      body: { title, conversations, position },
    }),
    async onQueryStarted(_arg, { queryFulfilled }) {
      const { data } = await queryFulfilled;
      updateConversationsState((state) => {
        state.folders.push(data);
      });
    },
  }),

  updatePinnedPosition: builder.mutation<
    void,
    {
      updates: Array<{
        conversationId: string;
        newPinnedPosition: number | null;
      }>;
      folderId: string;
    }
  >({
    query: ({ updates, folderId }) => ({
      url: `chat/pinned-positions`,
      method: "PATCH",
      body: { updates, folderId },
    }),
  }),

  addConversationToFolder: builder.mutation<
    void,
    { conversationId: string; folderId: string }
  >({
    query: ({ conversationId, folderId }) => ({
      url: `/chat/folders/${folderId}/conversations/${conversationId}`,
      method: "POST",
    }),
  }),
  removeConversationFromFolder: builder.mutation<
    void,
    { conversationId: string; folderId: string }
  >({
    query: ({ conversationId, folderId }) => ({
      url: `/chat/folders/${folderId}/conversations/${conversationId}`,
      method: "DELETE",
    }),
  }),

  renameFolder: builder.mutation<void, { folderId: string; newTitle: string }>({
    query: ({ folderId, newTitle }) => ({
      url: `chat/folders/${folderId}`,
      method: "PATCH",
      body: { newTitle },
    }),
  }),

  deleteFolder: builder.mutation<void, { folderId: string }>({
    query: ({ folderId }) => ({
      url: `chat/folders/${folderId}`,
      method: "DELETE",
    }),
  }),
});

export default buildFolderEndpoints;
