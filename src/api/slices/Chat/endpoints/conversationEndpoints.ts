import { setConversation } from "@redux/global";
import type {
  Conversation,
  ConversationsState,
  EditableConversationFields,
  SearchResponse,
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
} from "../handlers/messageHandlers";
import {
  onLastSeenAtUpdate,
  onNewConversation,
} from "../handlers/conversationHandlers";
import { onNewReaction, onRemoveReaction } from "../handlers/reactionHandlers";
import { onUserActive, onUserStopActive } from "../handlers/activityHandlers";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { updateConversation } from "@api/slices/helpers/ConversationsManage";
import connectToConversation from "@utils/socket/actions/conversationActions/connectToConversation";

const buildConversationEndpoints = (builder: Builder) => ({
  search: builder.query<SearchResponse, { query: string }>({
    query: ({ query }) => ({
      url: `chat/search`,
      params: { query },
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
        updateConversation(data.id, () => data);

        if (isTemp) {
          updateMessages(data.id, (messages) => {
            messages.items = [];
            messages.hasMoreUp = false;
            messages.hasMoreDown = false;
            messages.fromUser = false;
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

      socket.on("message:edited", onMessageEdited);
      socket.on("reaction:removed", onRemoveReaction);
      socket.on("reaction:new", onNewReaction);
      socket.on("conversation:new", onNewConversation);
      socket.on("message:new", onNewMessage);
      socket.on("message:deleted", onDeleteMessage);
      socket.on("activity:start", onUserActive);
      socket.on("activity:stop", onUserStopActive);

      await cacheEntryRemoved;

      socket.off("message:edited", onMessageEdited);
      socket.off("reaction:removed", onRemoveReaction);
      socket.off("reaction:new", onNewReaction);
      socket.off("message:new", onNewMessage);
      socket.off("message:deleted", onDeleteMessage);
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
});

export default buildConversationEndpoints;
