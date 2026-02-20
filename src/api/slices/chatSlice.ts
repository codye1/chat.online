import api from "@api/api";
import type { RootState } from "@redux/store";
import socket, {
  connectToConversation,
  syncSocketAuthorizationFromStorage,
} from "@utils/socket";
import type { Conversation, Message, SearchResponse } from "@utils/types";

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
      query: ({ query }) => `chat/search?query=${query}`,
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
        arg,
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
        const state = getState() as RootState;
        const user = state.auth.user;

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
              if (lastReadMessage.senderId === user.id) {
                draft.lastReadId = lastReadMessage.id;
              } else {
                draft.lastReadIdByParticipants = lastReadMessage.id;
              }
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

        const onUpdateConversation = (conversation: Conversation) => {
          // Це спрацює, коли ми створили/знайшли чат з recipientId
          // Оновлюємо кеш для запиту по recipientId
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: arg.recipientId, conversationId: null },
              () => conversation,
            ),
          );

          // Оновлюємо кеш для запиту по conversationId на всяк випадок
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: arg.conversationId },
              () => conversation,
            ),
          );

          // Оновлюємо кеш для списку розмов
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const index = draft.findIndex((c) => c.id === conversation.id);

                if (index !== -1) {
                  draft[index] = conversation;
                } else {
                  draft.push(conversation);
                }
              },
            ),
          );
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

    getConversations: builder.query<Conversation[], void>({
      query: () => `chat/conversations`,

      async onCacheEntryAdded(
        _arg,
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved,
          dispatch,
          getState,
        },
      ) {
        await cacheDataLoaded;

        syncSocketAuthorizationFromStorage();
        updateCachedData((draft) => {
          const convoIds = draft.map((c) => c.id);
          connectToConversation(convoIds, null);
        });

        const onUserTyping = ({
          conversationId,
          nickname,
        }: {
          conversationId: string;
          nickname: string;
        }) => {
          const state = getState() as RootState;
          const user = state.auth.user;

          if (nickname === user.nickname) {
            return;
          }
          updateCachedData((draft) => {
            const convo = draft.find((c) => c.id === conversationId);
            if (convo) {
              convo.typingUsers = convo.typingUsers || [];
              if (!convo.typingUsers.includes(nickname)) {
                convo.typingUsers.push(nickname);
              }
            }
          });
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId },
              (draft) => {
                if (draft) {
                  draft.typingUsers = draft.typingUsers || [];
                  if (!draft.typingUsers.includes(nickname)) {
                    draft.typingUsers.push(nickname);
                  }
                }
              },
            ),
          );
        };

        const onUserStopTyping = ({
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
            const convo = draft.find((c) => c.id === conversationId);
            if (convo && convo.typingUsers) {
              convo.typingUsers = convo.typingUsers.filter(
                (id) => id !== nickname,
              );
            }
          });
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId },
              (draft) => {
                if (draft && draft.typingUsers) {
                  draft.typingUsers = draft.typingUsers.filter(
                    (id) => id !== nickname,
                  );
                }
              },
            ),
          );
        };

        const onNewMessage = (message: Message) => {
          const state = getState() as RootState;

          updateCachedData((draft) => {
            const convo = draft.find((c) => c.id === message.conversationId);

            if (convo) {
              convo.lastMessage = message;

              if (state.auth.user.id !== message.senderId) {
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

                  if (state.auth.user.id !== message.senderId) {
                    draft.unreadMessages += 1;
                  }
                }
              },
            ),
          );

          const conversation = (getState() as RootState).global.conversationId;

          if (conversation !== message.conversationId) {
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

        const onNewConversation = (conversation: Conversation) => {
          connectToConversation([conversation.id], null);
          updateCachedData((draft) => {
            const exists = draft.find((c) => c.id === conversation.id);
            if (!exists) {
              draft.push(conversation);
            }
          });
        };

        socket.on("conversation:new", onNewConversation);
        socket.on("message:new", onNewMessage);
        socket.on("typing:start", onUserTyping);
        socket.on("typing:stop", onUserStopTyping);

        await cacheEntryRemoved;

        socket.off("message:new", onNewMessage);
        socket.off("conversation:new", onNewConversation);
        socket.off("typing:start", onUserTyping);
        socket.off("typing:stop", onUserStopTyping);
      },
    }),
    getMessages: builder.query<
      MessagesResponse,
      {
        conversationId: string;
        cursor?: string;
        direction?: "UP" | "DOWN";
        jumpToLatest?: boolean;
      }
    >({
      query: ({ conversationId, cursor, direction, jumpToLatest }) => ({
        url: `chat/conversations/${conversationId}/messages`,
        method: "GET",
        params: {
          cursor,
          direction,
          jumpToLatest,
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
  }),
});

export const {
  useSearchQuery,
  useGetConversationQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
} = chatSlice;

export default chatSlice;
