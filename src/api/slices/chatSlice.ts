import api from "@api/api";
import { setConversation } from "@redux/global";
import type { RootState } from "@redux/store";
import socket, {
  connectToConversation,
  syncSocketAuthorizationFromStorage,
} from "@utils/socket";
import type {
  Conversation,
  ConversationPreview,
  Message,
  Reaction,
  Reactor,
  SearchResponse,
} from "@utils/types";

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

        if (arg.recipientId && data.id !== null) {
          dispatch(setConversation({ conversationId: data.id }));
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: data.id },
              () => data,
            ),
          );
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
          console.log("message readed" + lastReadMessage.id);

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
          console.log(conversation);

          // Update cache
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: conversation.id },
              () => conversation,
            ),
          );

          // Update conversations list cache
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

    getConversations: builder.query<ConversationPreview[], void>({
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
          connectToConversation(convoIds);
        });

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
            const convo = draft.find((c) => c.id === conversationId);
            if (convo) {
              convo.activeUsers = convo.activeUsers || [];
              if (!convo.activeUsers.find((u) => u.nickname === nickname)) {
                convo.activeUsers.push({ nickname, reason });
              }
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
            const convo = draft.find((c) => c.id === conversationId);
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
          const conversation = state.global.conversationId;

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

          dispatch(
            chatSlice.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const convo = draft.find((c) => c.id === conversationId);
                if (convo) {
                  convo.lastMessage = lastMessageSnapshot;
                }
              },
            ),
          );
        };

        const onNewConversation = ({
          conversation,
          recipientId,
          initiator,
        }: {
          conversation: Conversation;
          recipientId: string;
          initiator?: string;
        }) => {
          connectToConversation([conversation.id]);
          updateCachedData((draft) => {
            const exists = draft.find((c) => c.id === conversation.id);
            if (!exists) {
              draft.push(conversation);
            }
          });
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversation",
              { recipientId: null, conversationId: conversation.id },
              () => conversation,
            ),
          );
          const state = getState() as RootState;

          if (
            state.global.recipientId === recipientId ||
            state.global.recipientId === initiator
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
          newReaction: Reaction & { user: Reactor };
          prevReaction?: Reaction & { user: Reactor };
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
          removedReaction: Reaction & { user: Reactor };
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
          console.log(editedMessage);

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
          dispatch(
            chatSlice.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const convo = draft.find(
                  (c) => c.id === editedMessage.conversationId,
                );
                if (convo && convo.lastMessage?.id === editedMessage.id) {
                  convo.lastMessage = editedMessage;
                }
              },
            ),
          );
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
    getReactors: builder.query<
      Reactor[],
      {
        messageId: string;
        conversationId: string;
        reaction?: string;
        cursor?: string;
      }
    >({
      query: ({ messageId, conversationId, reaction, cursor }) => ({
        url: `chat/conversations/${conversationId}/messages/${messageId}/reactors`,
        method: "GET",
        params: {
          ...(reaction ? { reaction } : {}),
          ...(cursor ? { cursor } : {}),
        },
      }),
    }),
  }),
});

export const {
  useSearchQuery,
  useGetConversationQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetReactorsQuery,
} = chatSlice;

export default chatSlice;
