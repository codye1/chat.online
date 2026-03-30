import type { Message } from "@utils/types";
import type { Builder } from "../chatSlice";

export interface MessagesResponse {
  items: Message[];
  hasMoreUp: boolean;
  hasMoreDown: boolean;
  anchor?: string;
  fromUser: boolean;
}

const buildMessageEndpoints = (builder: Builder) => ({
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
});

export default buildMessageEndpoints;
