import { markMessageAsRead } from "@utils/socket";
import type { Conversation, Message } from "@utils/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useObserver from "@hooks/useObserver";

const useHandleUnreadMessages = ({
  conversation,
}: {
  conversation: Conversation;
}) => {
  const observedMessages = useRef<Set<string>>(new Set());
  useEffect(() => {
    observedMessages.current.clear();
  }, [conversation.id]);

  const handleRead = useCallback(
    (entry: IntersectionObserverEntry) => {
      const messageId = entry.target.id;
      if (observedMessages.current.has(messageId)) {
        return;
      }
      observedMessages.current.add(messageId);
      markMessageAsRead(conversation.id, messageId);
    },
    [conversation.id],
  );

  const { setRef } = useObserver(
    handleRead,
    useMemo(() => ({ threshold: 1 }), []),
  );

  const trackUnreadMessageRef = (
    node: Element | null | undefined,
    message: Message,
  ) => {
    if (
      node &&
      (conversation.lastReadId === null || message.id > conversation.lastReadId)
    ) {
      setRef(node);
    }
  };

  return { trackUnreadMessageRef };
};

export default useHandleUnreadMessages;
