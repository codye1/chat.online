import resetUnreadMessagesCount from "@utils/resetUnreadMessagesCount";
import type { Conversation, Message } from "@utils/types";
import { useLayoutEffect, useRef, type UIEvent } from "react";

interface IUseControlScroll {
  messages?: {
    items: Message[];
    hasMoreUp: boolean;
    hasMoreDown: boolean;
  };
  rootNode: HTMLDivElement | null;
  queryParams: {
    cursor?: string;
    direction?: "UP" | "DOWN";
    jumpToLatest?: boolean;
  };
  setQueryParams: React.Dispatch<
    React.SetStateAction<{
      cursor?: string;
      direction?: "UP" | "DOWN";
      jumpToLatest?: boolean;
    }>
  >;
  conversation: Conversation;
}

const useControlScroll = ({
  messages,
  rootNode,
  queryParams,
  setQueryParams,
  conversation,
}: IUseControlScroll) => {
  const oldScrollHeightRef = useRef<number>(0);
  const oldScrollTopRef = useRef<number>(0);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    oldScrollHeightRef.current = event.currentTarget.scrollHeight;
    oldScrollTopRef.current = event.currentTarget.scrollTop;
  };

  useLayoutEffect(() => {
    if (!rootNode || !messages) return;

    // Not ideal, but I don’t know a better way to do it for now.
    if (queryParams.direction === "DOWN") {
      const difference = rootNode.scrollHeight - oldScrollHeightRef.current;
      rootNode.scrollTo({ top: oldScrollTopRef.current - difference });
      setQueryParams((prev) => ({ ...prev, direction: undefined }));
    }
  }, [messages]);

  const scrollToBottom = () => {
    rootNode?.scrollTo({ top: rootNode.scrollHeight, behavior: "smooth" });

    if (conversation.unreadMessages > 0) {
      resetUnreadMessagesCount(conversation.id);
      setQueryParams({ jumpToLatest: true });
    }
  };

  return { onScroll, scrollToBottom };
};

export default useControlScroll;
