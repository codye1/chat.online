import type { ReactorListItem } from "@utils/types";
import type { Builder } from "../chatSlice";

const buildReactionsEndpoints = (builder: Builder) => ({
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
    query: ({ messageId, conversationId, reactionContent, cursor, take }) => ({
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
      const newCursor = newItems.items[newItems.items.length - 1]?.reaction.id;

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
});

export default buildReactionsEndpoints;
