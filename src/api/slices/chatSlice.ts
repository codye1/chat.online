import api from "@api/api";
import { setConversation } from "@redux/global";
import type { RootState } from "@redux/store";
import socket, {
  connectToConversation,
  syncSocketAuthorizationFromStorage,
} from "@utils/socket";
import type {
  Conversation,
  Message,
  Reaction,
  UserPreview,
  ReactorListItem,
  SearchResponse,
  ConversationsState,
  Folder,
  EditableConversationFields,
} from "@utils/types";
import { updateConversationsState } from "./helpers/ConversationsManage";

export interface MessagesResponse {
  items: Message[];
  hasMoreUp: boolean;
  hasMoreDown: boolean;
  anchor?: string;
  fromUser: boolean;
}

const chatSlice = api.injectEndpoints({
  endpoints: (builder) => ({
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
          dispatch(
            chatSlice.util.upsertQueryData(
              "getConversation",
              { recipientId: null, conversationId: data.id },
              data,
            ),
          );

          if (isTemp) {
            dispatch(
              chatSlice.util.upsertQueryData(
                "getMessages",
                { conversationId: data.id },
                {
                  items: [],
                  hasMoreUp: false,
                  hasMoreDown: false,
                  fromUser: false,
                },
              ),
            );
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
      async onCacheEntryAdded(
        _arg,
        {
          cacheDataLoaded,
          cacheEntryRemoved,
          dispatch,
          updateCachedData,
          getState,
        },
      ) {
        await cacheDataLoaded;

        syncSocketAuthorizationFromStorage();

        const onMessageRead = ({
          lastReadMessage,
          conversationId,
        }: {
          lastReadMessage: {
            id: string;
            senderId: string;
          };
          conversationId: string;
        }) => {
          updateCachedData((draft) => {
            if (draft.id === conversationId) {
              draft.lastReadIdByParticipants = lastReadMessage.id;
            }
          });
        };

        const onLastSeenAtUpdate = ({
          userId,
          lastSeenAt,
        }: {
          userId: string;
          lastSeenAt: string;
        }) => {
          updateCachedData((draft) => {
            if (
              draft.type === "DIRECT" &&
              draft.otherParticipant.id === userId
            ) {
              draft.lastSeenAt = lastSeenAt;
            }
          });
        };

        const onUpdateConversation = ({
          conversation,
          recipientId,
        }: {
          conversation: Conversation;
          recipientId: string;
        }) => {
          // Triggered when a chat was created/found by recipientId

          const state = getState() as RootState;
          const { recipientId: globalRecipientId } = state.global;

          if (globalRecipientId == recipientId) {
            dispatch(setConversation({ conversationId: conversation.id }));
          }
          // Update cache
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: conversation.id },
              () => conversation,
            ),
          );

          // Update conversations list cache
          updateConversationsState((draft) => {
            draft.byId[conversation.id] = conversation;
          });
        };

        socket.on("message:read", onMessageRead);
        socket.on("conversation:update", onUpdateConversation);
        socket.on("lastSeenAt:update", onLastSeenAtUpdate);

        await cacheEntryRemoved;

        socket.off("message:read", onMessageRead);
        socket.off("conversation:update", onUpdateConversation);
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
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved,
          dispatch,
          getState,
          getCacheEntry,
        },
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

        const onUserActive = ({
          conversationId,
          nickname,
          reason,
        }: {
          conversationId: string;
          nickname: string;
          reason: "typing" | "editing";
        }) => {
          const state = getState() as RootState;
          const user = state.auth.user;

          if (nickname === user.nickname) {
            return;
          }
          updateCachedData((draft) => {
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
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId },
              (draft) => {
                if (draft) {
                  draft.activeUsers = draft.activeUsers || [];
                  if (!draft.activeUsers.find((u) => u.nickname === nickname)) {
                    draft.activeUsers.push({ nickname, reason });
                  }
                }
              },
            ),
          );
        };

        const onUserStopActive = ({
          conversationId,
          nickname,
        }: {
          conversationId: string;
          nickname: string;
        }) => {
          if (nickname === (getState() as RootState).auth.user.nickname) {
            return;
          }

          updateCachedData((draft) => {
            const convo = draft.byId[conversationId];
            if (convo && convo.activeUsers) {
              convo.activeUsers = convo.activeUsers.filter(
                (u) => u.nickname !== nickname,
              );
            }
          });
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId },
              (draft) => {
                if (draft && draft.activeUsers) {
                  draft.activeUsers = draft.activeUsers.filter(
                    (id) => id.nickname !== nickname,
                  );
                }
              },
            ),
          );
        };
        const onNewMessage = (message: Message) => {
          const state = getState() as RootState;
          const conversationId = state.global.conversationId;
          const conversationsState =
            chatSlice.endpoints.getConversations.select(undefined)(state)?.data;
          const conversation = conversationsState?.byId[message.conversationId];

          if (!conversation) {
            chatSlice.endpoints.getConversations.initiate({
              ids: [message.conversationId],
            });
            return;
          }

          updateCachedData((draft) => {
            const convo = draft.byId[message.conversationId];

            if (convo) {
              convo.lastMessage = message;

              if (state.auth.user.id !== message.sender.id) {
                convo.unreadMessages += 1;
              }
            }
          });

          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: message.conversationId },
              (draft) => {
                if (draft) {
                  draft.lastMessage = message;

                  if (state.auth.user.id !== message.sender.id) {
                    draft.unreadMessages += 1;
                  }
                }
              },
            ),
          );

          if (conversationId !== message.conversationId) {
            dispatch(
              chatSlice.util.updateQueryData(
                "getMessages",
                { conversationId: message.conversationId },
                (messagesDraft) => {
                  messagesDraft.hasMoreDown = true;
                },
              ),
            );
            return;
          }

          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId: message.conversationId },
              (messagesDraft) => {
                if (!messagesDraft.hasMoreDown) {
                  messagesDraft.items.push(message);
                  messagesDraft.fromUser = true;
                }
              },
            ),
          );
        };

        const onDeleteMessage = ({
          conversationId,
          messageId,
        }: {
          conversationId: string;
          messageId: string;
        }) => {
          let lastMessageSnapshot: {
            text: string;
            createdAt: string;
            id: string;
          } | null = null;
          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId },
              (draft) => {
                if (draft && draft.items) {
                  draft.items = draft.items.filter((m) => m.id !== messageId);
                  const last = draft.items[draft.items.length - 1];
                  if (last) {
                    lastMessageSnapshot = {
                      text: last.text,
                      createdAt: last.createdAt,
                      id: last.id,
                    };
                  }
                }
              },
            ),
          );

          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId },
              (draft) => {
                if (draft) {
                  draft.lastMessage = lastMessageSnapshot;
                }
              },
            ),
          );

          updateConversationsState((draft) => {
            const convo = draft.byId[conversationId];
            if (convo) {
              convo.lastMessage = lastMessageSnapshot;
            }
          });
        };

        const onNewConversation = ({
          conversation,
          recipientId,
          initiator,
          firstMessage,
        }: {
          conversation: Conversation;
          recipientId: string;
          initiator?: string;
          firstMessage: Message;
        }) => {
          connectToConversation([conversation.id]);
          updateCachedData((draft) => {
            draft.byId[conversation.id] = conversation;
            draft.activeIds.unpinned.unshift(conversation.id);
          });
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: conversation.id },
              () => conversation,
            ),
          );

          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId: conversation.id },
              (draft) => {
                draft.items = [firstMessage];
                draft.hasMoreUp = false;
                draft.hasMoreDown = false;
              },
            ),
          );
          const state = getState() as RootState;
          const isTempSelected =
            state.global.conversationId?.startsWith("tempId");
          const tempId = state.global.conversationId?.split(":")[1];
          if (
            isTempSelected &&
            (tempId === recipientId || tempId === initiator)
          ) {
            dispatch(setConversation({ conversationId: conversation.id }));
          }
        };

        const onNewReaction = ({
          conversationId,
          messageId,
          newReaction,
          prevReaction,
        }: {
          conversationId: string;
          messageId: string;
          newReaction: Reaction & { user: UserPreview };
          prevReaction?: Reaction & { user: UserPreview };
        }) => {
          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId },
              (draft) => {
                if (draft && draft.items) {
                  const message = draft.items.find((m) => m.id === messageId);
                  if (message) {
                    if (prevReaction) {
                      const prevReactionGroup =
                        message.reactions[prevReaction.content];

                      if (prevReactionGroup) {
                        prevReactionGroup.users =
                          prevReactionGroup.users.filter(
                            (u) => u.id !== prevReaction.user.id,
                          );
                        prevReactionGroup.count -= 1;

                        if (prevReactionGroup.count <= 0) {
                          delete message.reactions[prevReaction.content];
                        }

                        const state = getState() as RootState;
                        if (prevReaction.user.id === state.auth.user.id) {
                          prevReactionGroup.isActive = false;
                        }
                      }
                    }

                    if (!message.reactions[newReaction.content]) {
                      message.reactions[newReaction.content] = {
                        count: 0,
                        users: [],
                        isActive: false,
                      };
                    }

                    message.reactions[newReaction.content].count += 1;

                    message.reactions[newReaction.content].users.push(
                      newReaction.user,
                    );

                    const state = getState() as RootState;
                    if (newReaction.user.id === state.auth.user.id) {
                      message.reactions[newReaction.content].isActive = true;
                    }
                  }
                }
              },
            ),
          );
        };

        const onRemoveReaction = ({
          conversationId,
          messageId,
          removedReaction,
        }: {
          conversationId: string;
          messageId: string;
          removedReaction: Reaction & { user: UserPreview };
        }) => {
          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId },
              (draft) => {
                if (draft && draft.items) {
                  const message = draft.items.find((m) => m.id === messageId);

                  if (message) {
                    const removedReactionGroup =
                      message.reactions[removedReaction.content];

                    if (removedReactionGroup) {
                      removedReactionGroup.users =
                        removedReactionGroup.users.filter(
                          (u) => u.id !== removedReaction.user.id,
                        );
                      removedReactionGroup.count -= 1;
                      if (removedReactionGroup.count <= 0) {
                        delete message.reactions[removedReaction.content];
                      }

                      const state = getState() as RootState;
                      if (removedReaction.user.id === state.auth.user.id) {
                        removedReactionGroup.isActive = false;
                      }
                    }
                  }
                }
              },
            ),
          );
        };

        const onMessageEdited = ({
          editedMessage,
        }: {
          editedMessage: Message;
        }) => {
          dispatch(
            chatSlice.util.updateQueryData(
              "getMessages",
              { conversationId: editedMessage.conversationId },
              (draft) => {
                if (draft && draft.items) {
                  const messageIndex = draft.items.findIndex(
                    (m) => m.id === editedMessage.id,
                  );
                  if (messageIndex !== -1) {
                    draft.items[messageIndex] = editedMessage;
                  }
                }
              },
            ),
          );
          updateCachedData((draft) => {
            const convo = draft.byId[editedMessage.conversationId];
            if (convo && convo.lastMessage?.id === editedMessage.id) {
              convo.lastMessage = editedMessage;
            }
          });
        };

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

    getMessages: builder.query<
      MessagesResponse,
      {
        conversationId: string;
        cursor?: string;
        direction?: "UP" | "DOWN";
        jumpToLatest?: boolean;
        take?: number;
      }
    >({
      query: ({ conversationId, cursor, direction, jumpToLatest, take }) => ({
        url: `chat/conversations/${conversationId}/messages`,
        method: "GET",
        params: {
          cursor,
          direction,
          jumpToLatest,
          take: take ?? 20,
        },
      }),
      keepUnusedDataFor: Number.MAX_SAFE_INTEGER,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.conversationId}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        currentCache.fromUser = false;
        if (typeof newItems.hasMoreUp !== "undefined") {
          currentCache.hasMoreUp = newItems.hasMoreUp;
        }

        if (typeof newItems.hasMoreDown !== "undefined") {
          currentCache.hasMoreDown = newItems.hasMoreDown;
        }

        if (arg.jumpToLatest) {
          currentCache.items = newItems.items;
          return;
        }

        if (arg.direction === "UP") {
          currentCache.items.unshift(...newItems.items);
        }

        if (arg.direction === "DOWN") {
          currentCache.items.push(...newItems.items);
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
          currentArg.cursor !== previousArg.cursor ||
          currentArg.direction !== previousArg.direction ||
          currentArg.jumpToLatest !== previousArg.jumpToLatest
        );
      },
    }),
    getReactors: builder.query<
      { items: ReactorListItem[]; hasMore: boolean },
      {
        messageId: string;
        conversationId: string;
        reactionContent: string;
        cursor?: string;
        take?: number;
      }
    >({
      query: ({
        messageId,
        conversationId,
        reactionContent,
        cursor,
        take,
      }) => ({
        url: `chat/conversations/${conversationId}/messages/${messageId}/reactors`,
        method: "GET",
        params: {
          ...(reactionContent ? { reactionContent } : {}),
          ...(cursor ? { cursor } : {}),
          take: take ?? 20,
        },
      }),
      keepUnusedDataFor: Number.MAX_SAFE_INTEGER,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.messageId}-${queryArgs.conversationId}-${queryArgs.reactionContent}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        const nextCursor = arg.cursor;
        const newCursor =
          newItems.items[newItems.items.length - 1]?.reaction.id;

        if (nextCursor && newCursor && nextCursor !== newCursor) {
          currentCache.items.push(...newItems.items);
          currentCache.hasMore = newItems.hasMore;
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
          currentArg.messageId !== previousArg.messageId ||
          currentArg.conversationId !== previousArg.conversationId ||
          currentArg.reactionContent !== previousArg.reactionContent ||
          currentArg.cursor !== previousArg.cursor
        );
      },
    }),
    createFolder: builder.mutation<
      Folder,
      { title: string; position: number; conversations?: string[] }
    >({
      query: ({ title, conversations, position }) => ({
        url: `chat/folders`,
        method: "POST",
        body: { title, conversations, position },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;

        dispatch(
          chatSlice.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              draft.folders.push(data);
            },
          ),
        );
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
        url: `chat/conversations/pin`,
        method: "PATCH",
        body: { updates, folderId },
      }),
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
  }),
});

export const {
  useSearchQuery,
  useGetConversationQuery,
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetMessagesQuery,
  useGetReactorsQuery,
  useCreateFolderMutation,
  useUpdatePinnedPositionMutation,
  useUpdateConversationSettingsMutation,
} = chatSlice;

const DEFAULT_CONVERSATIONS_STATE: ConversationsState = {
  byId: {},
  activeIds: { pinned: [], unpinned: [] },
  archivedIds: { pinned: [], unpinned: [] },
  folders: [],
};

export const useConversationsQuery = (
  args?: { ids?: string[] },
  options?: { refetchOnMountOrArgChange?: boolean },
) =>
  useGetConversationsQuery(args ?? undefined, {
    ...options,
    selectFromResult: ({ data, ...rest }) => ({
      data: data ?? DEFAULT_CONVERSATIONS_STATE,
      ...rest,
    }),
  });

export default chatSlice;
