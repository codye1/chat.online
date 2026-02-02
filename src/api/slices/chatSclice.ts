import api from "@api/api";
import type { RootState } from "@redux/store";
import socket, {
  connectToConversation,
  syncSocketAuthorizationFromStorage,
} from "@utils/socket";
import type { Conversation, Message, SearchResponse } from "@utils/types";

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

      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch },
      ) {
        await cacheDataLoaded;

        syncSocketAuthorizationFromStorage();
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

        socket.on("conversation:update", onUpdateConversation);

        await cacheEntryRemoved;

        socket.off("conversation:update", onUpdateConversation);
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
              "getMessages",
              { conversationId: message.conversationId },
              (messagesDraft) => {
                messagesDraft.unshift(message);
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

        await cacheEntryRemoved;

        socket.off("message:new", onNewMessage);
        socket.off("conversation:new", onNewConversation);
      },
    }),
    getMessages: builder.query<Message[], { conversationId: string }>({
      query: ({ conversationId }) =>
        `chat/conversations/${conversationId}/messages`,

      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData },
      ) {
        await cacheDataLoaded;

        syncSocketAuthorizationFromStorage();

        const onMessageRead = (data: {
          conversationId: string;
          lastReadMessageId: string;
        }) => {
          if (data.conversationId !== arg.conversationId) return;
          updateCachedData((draft) => {
            draft.forEach((message) => {
              if (message.id <= data.lastReadMessageId) {
                message.read = true;
              }
            });
          });
        };

        socket.on("message:read", onMessageRead);

        await cacheEntryRemoved;

        socket.off("message:read", onMessageRead);
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
