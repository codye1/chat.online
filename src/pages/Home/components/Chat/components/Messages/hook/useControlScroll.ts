import type { MessagesResponse } from "@api/slices/chatSclice";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { Conversation } from "@utils/types";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

interface iuseControlScroll {
  conversation: Conversation;
  messages?: MessagesResponse;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  prevConversationIdRef: RefObject<string>;
}

const useControlScroll = ({
  conversation,
  messages,
  virtualizer,
  prevConversationIdRef,
}: iuseControlScroll) => {
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());

  useLayoutEffect(() => {
    return () => {
      if (virtualizer.scrollOffset !== null) {
        scrollPositionsRef.current.set(
          conversation.id,
          virtualizer.scrollOffset,
        );
      }
    };
  }, [conversation.id, virtualizer]);

  useEffect(() => {
    if (messages?.fromUser) {
      scrollPositionsRef.current.delete(conversation.id);
      virtualizer.scrollToIndex(messages.items.length - 1, {
        align: "end",
        behavior: "auto",
      });
    }
  }, [messages, virtualizer, conversation.id]);

  useLayoutEffect(() => {
    if (conversation.id === prevConversationIdRef.current) {
      return;
    }

    prevConversationIdRef.current = conversation.id;

    const savedScrollPosition = scrollPositionsRef.current.get(conversation.id);

    if (savedScrollPosition !== undefined) {
      requestAnimationFrame(() => {
        console.log("SAVED:", {
          savedScrollPosition,
          scrollOffset: virtualizer.scrollOffset,
          height: virtualizer.getTotalSize(),
          offset: virtualizer,
        });

        virtualizer.scrollToOffset(savedScrollPosition, { align: "start" });
        console.log(virtualizer.scrollOffset);
      });
      return;
    }

    virtualizer.calculateRange();
    if (conversation.unreadMessages > 0 && !messages?.hasMoreUp) {
      requestAnimationFrame(() => {
        virtualizer.scrollToOffset(0, { align: "start" });
      });
      return;
    }

    requestAnimationFrame(() => {
      virtualizer.scrollToOffset(Infinity, {
        align: "end",
        behavior: "auto",
      });
    });
  }, [virtualizer, conversation, messages, prevConversationIdRef]);

  return { scrollPositionsRef };
};

export default useControlScroll;
