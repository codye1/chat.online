import { setConversation } from "@redux/global";
import type {
  Conversation,
  ConversationsState,
  EditableConversationFields,
  SearchResponse,
  UserPreviewAtConversation,
} from "@utils/types";
import { type Builder } from "../chatSlice";
import socket, {
  syncSocketAuthorizationFromStorage,
} from "@utils/socket/socket";
import {
  onDeleteMessage,
  onMessageEdited,
  onMessageRead,
  onNewMessage,
  onSentMessage,
  upsertMessages,
} from "../handlers/messageHandlers";
import {
  onDeleteConversation,
  onLastSeenAtUpdate,
  onNewConversation,
  onParticipantAddedToConversation,
  onUserRemovedFromConversation,
} from "../handlers/conversationHandlers";
import { onNewReaction, onRemoveReaction } from "../handlers/reactionHandlers";
import { onUserActive, onUserStopActive } from "../handlers/activityHandlers";
import connectToConversation from "@utils/socket/actions/conversationActions/connectToConversation";
import { upsertConversation } from "@api/slices/helpers/ConversationsManage";

const buildConversationEndpoints = (builder: Builder) => ({
  search: builder.query<SearchResponse, { query: string; type?: string }>({
    query: ({ query, type }) => ({
      url: `chat/search`,
      params: { query, type },
    }),
  }),

  getConversation: builder.query<
    Conversation,
    { recipientId: string | null; conversationId: string | null }
  >({
    query: (params) => ({
      url: `chat/conversation`,
      method: "GET",
      params: {
        ...(params.recipientId ? { recipientId: params.recipientId } : {}),
        ...(params.conversationId
          ? { conversationId: params.conversationId }
          : {}),
      },
    }),
    async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      const { data } = await queryFulfilled;

      if (arg.recipientId) {
        const isTemp = data.id.startsWith("tempId");

        dispatch(setConversation({ conversationId: data.id }));

        if (isTemp) {
          upsertConversation(data);
          upsertMessages(data.id, {
            items: [],
            hasMoreUp: false,
            hasMoreDown: false,
            fromUser: false,
          });
        }
      }
    },
    forceRefetch({ currentArg, previousArg }) {
      if (!currentArg) {
        return false;
      }

      if (!previousArg) {
        return true;
      }

      return (
        currentArg.conversationId !== previousArg.conversationId ||
        currentArg.recipientId !== previousArg.recipientId
      );
    },
    async onCacheEntryAdded(_arg, ctx) {
      await ctx.cacheDataLoaded;

      syncSocketAuthorizationFromStorage();

      socket.on("message:read", onMessageRead);
      socket.on("conversation:update", onLastSeenAtUpdate);
      socket.on("lastSeenAt:update", onLastSeenAtUpdate);

      await ctx.cacheEntryRemoved;

      socket.off("message:read", onMessageRead);
      socket.off("conversation:update", onLastSeenAtUpdate);
      socket.off("lastSeenAt:update", onLastSeenAtUpdate);
    },
  }),

  getConversations: builder.query<
    ConversationsState,
    { ids?: string[] } | void
  >({
    query: (arg) => {
      return !arg
        ? `chat/conversations/init`
        : {
            url: `chat/conversations`,
            params: { ids: arg.ids?.join(",") },
          };
    },
    serializeQueryArgs: () => "getConversations",
    merge: (currentCache, newItems) => {
      Object.assign(currentCache.byId, newItems.byId);
    },
    forceRefetch({ currentArg, previousArg }) {
      if (!currentArg) {
        return false;
      }
      if (!previousArg) {
        return true;
      }
      return currentArg.ids !== previousArg.ids;
    },
    async onCacheEntryAdded(
      _arg,
      { cacheDataLoaded, cacheEntryRemoved, getCacheEntry },
    ) {
      await cacheDataLoaded;

      syncSocketAuthorizationFromStorage();

      const state = getCacheEntry().data;

      if (state) {
        const conversationIds = [
          ...state.activeIds.pinned,
          ...state.activeIds.unpinned,
          ...state.archivedIds.pinned,
          ...state.archivedIds.unpinned,
        ];

        connectToConversation(conversationIds);
      }

      socket.on(
        "conversation:participantsAdded",
        onParticipantAddedToConversation,
      );
      socket.on("conversation:userRemoved", onUserRemovedFromConversation);
      socket.on("conversation:deleted", onDeleteConversation);
      socket.on("message:edited", onMessageEdited);
      socket.on("reaction:removed", onRemoveReaction);
      socket.on("reaction:new", onNewReaction);
      socket.on("conversation:new", onNewConversation);
      socket.on("message:new", onNewMessage);
      socket.on("message:sent", onSentMessage);
      socket.on("message:deleted", onDeleteMessage);
      socket.on("activity:start", onUserActive);
      socket.on("activity:stop", onUserStopActive);

      await cacheEntryRemoved;

      socket.off(
        "conversation:participantsAdded",
        onParticipantAddedToConversation,
      );
      socket.off("conversation:userRemoved", onUserRemovedFromConversation);
      socket.off("message:edited", onMessageEdited);
      socket.off("reaction:removed", onRemoveReaction);
      socket.off("reaction:new", onNewReaction);
      socket.off("message:new", onNewMessage);
      socket.off("message:sent", onSentMessage);
      socket.off("message:deleted", onDeleteMessage);
      socket.off("conversation:deleted", onDeleteConversation);
      socket.off("conversation:new", onNewConversation);
      socket.off("activity:start", onUserActive);
      socket.off("activity:stop", onUserStopActive);
    },
  }),

  updateConversationSettings: builder.mutation<
    void,
    { conversationId: string; settings: EditableConversationFields }
  >({
    query: ({ conversationId, settings }) => ({
      url: `chat/conversations/${conversationId}/settings`,
      method: "PATCH",
      body: settings,
    }),
  }),

  deleteConversation: builder.mutation<
    { success: boolean },
    { conversationId: string }
  >({
    query: ({ conversationId }) => ({
      url: `chat/conversations/${conversationId}`,
      method: "DELETE",
    }),
  }),

  createConversation: builder.mutation<
    Conversation,
    {
      participantIds: string[];
      title: string;
      avatarUrl: string | null;
      type: "DIRECT" | "GROUP";
    }
  >({
    query: ({ participantIds, title, avatarUrl, type }) => ({
      url: `chat/conversations`,
      method: "POST",
      body: { participantIds, title, avatarUrl, type },
    }),
  }),

  removeUserFromConversation: builder.mutation<
    { success: boolean },
    { conversationId: string; userId: string }
  >({
    query: ({ conversationId, userId }) => ({
      url: `chat/conversations/${conversationId}/participants/${userId}`,
      method: "DELETE",
    }),
  }),

  leaveConversation: builder.mutation<
    { success: boolean },
    { conversationId: string }
  >({
    query: ({ conversationId }) => ({
      url: `chat/conversations/${conversationId}/leave`,
      method: "POST",
    }),
  }),

  getConversationParticipants: builder.mutation<
    { participants: UserPreviewAtConversation[]; hasMore: boolean },
    { conversationId: string; cursor: string | null; take: number }
  >({
    query: ({ conversationId, cursor, take = 10 }) => ({
      url: `chat/conversations/${conversationId}/participants`,
      method: "GET",
      params: { cursor, take },
    }),
  }),

  addParticipantToConversation: builder.mutation<
    { success: boolean },
    { conversationId: string; participantIds: string[] }
  >({
    query: ({ conversationId, participantIds }) => ({
      url: `chat/conversations/${conversationId}/participants`,
      method: "POST",
      body: { participantIds },
    }),
  }),
});

export default buildConversationEndpoints;
