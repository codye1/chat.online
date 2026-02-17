import { markMessageAsRead } from "@utils/socket";
import type { Conversation, Message, User } from "@utils/types";
import { useCallback, useRef } from "react";
import useObserver from "@hooks/useObserver";

const useHandleUnreadMessages = ({
  conversation,
}: {
  conversation: Conversation;
  user: User;
}) => {
  const observedMessages = useRef<Set<string>>(new Set());

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

  const { setRef } = useObserver(handleRead, { threshold: 1.0 });

  const trackUnreadMessageRef = (
    node: Element | null | undefined,
    message: Message,
  ) => {
    if (
      node &&
      (message.id > conversation.lastReadId || conversation.lastReadId === null)
    ) {
      setRef(node);
    }
  };

  return { trackUnreadMessageRef };
};

export default useHandleUnreadMessages;
