import { useAppSelector } from "@hooks/hooks";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./Messages.module.css";
import Message from "../Message/Message";
import { useGetMessagesQuery } from "@api/slices/chatSclice";
import type { Conversation, Message as MessageType } from "@utils/types";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";
import useHandleUnreadMessages from "./hook/useHandleUnreadMessages";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import resetUnreadMessagesCount from "@utils/resetUnreadMessagesCount";
import checkIfNearBottom from "@utils/checkIfNearBottom";

// Fix messy

const Messages = ({ conversation }: { conversation: Conversation }) => {
  const user = useAppSelector((state) => state.auth.user);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [queryParams, setQueryParams] = useState<
    Record<
      string,
      {
        cursor?: string;
        direction?: "UP" | "DOWN";
        jumpToLatest?: boolean;
      }
    >
  >({});
  const prevIdRef = useRef("");
  const prevCountRef = useRef(0);
  const prevTotalSizeRef = useRef(0);
  const currentQueryParams = queryParams[conversation.id] || {};
  const prevConversationIdRef = useRef(conversation.id);
  const scrollPositionsRef = useRef<Map<string, { offset: number }>>(new Map());
  const attachToBottomRef = useRef(false);
  const { data, isFetching } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...currentQueryParams,
  });

  const [messages, setMessages] = useState(data?.items || []);

  useEffect(() => {
    if (data?.items) {
      if (prevConversationIdRef.current !== conversation.id) {
        scrollPositionsRef.current.set(prevConversationIdRef.current, {
          offset: virtualizer.scrollOffset || 0,
        });
        prevConversationIdRef.current = conversation.id;
      }
      attachToBottomRef.current = checkIfNearBottom(messagesRef.current!);
      setMessages(data.items);
    }
  }, [data]);

  const { trackUnreadMessageRef } = useHandleUnreadMessages({
    conversation,
    user,
  });

  const beforeInView = useInView({
    root: messagesRef.current,
    rootMargin: "300px 0px 0px 0px",
  });
  const afterInView = useInView({
    root: messagesRef.current,
    rootMargin: "0px 0px 300px 0px",
  });

  const virtualizer = useVirtualizer({
    count: messages?.length || 0,
    getScrollElement: () => messagesRef.current,
    estimateSize: () => 60,
    overscan: 5,
    getItemKey: useCallback(
      (index: number) => messages?.[index]?.id || index,
      [messages],
    ),
  });

  // Reset refs when conversation changes
  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== conversation.id) {
      prevIdRef.current = "";
      prevCountRef.current = 0;
      prevTotalSizeRef.current = 0;
      isUserInteractedRef.current = false;
    }
  }, [conversation.id, prevIdRef, prevCountRef, prevTotalSizeRef]);

  const scrollToBottom = useCallback(() => {
    if (!messagesRef.current || !messages.length) return;

    if (data?.hasMoreDown) {
      resetUnreadMessagesCount(conversation.id);
      setQueryParams((prev) => ({
        ...prev,
        [conversation.id]: {
          jumpToLatest: true,
          cursor: undefined,
          direction: undefined,
        },
      }));
    } else {
      virtualizer.scrollToIndex(messages.length - 1, {
        align: "end",
        behavior: "smooth",
      });
    }
  }, [messagesRef.current, messages?.length, virtualizer, data?.hasMoreDown]);

  useEffect(() => {
    if (beforeInView.inView && data?.hasMoreUp && !isFetching) {
      setQueryParams((prev) => ({
        ...prev,
        [conversation.id]: {
          cursor: messages?.length ? messages[0].id : undefined,
          direction: "UP",
        },
      }));
    }
  }, [beforeInView.inView, data?.hasMoreUp, messages, isFetching]);

  useEffect(() => {
    if (
      afterInView.inView &&
      data?.hasMoreDown &&
      !isFetching &&
      !currentQueryParams.jumpToLatest
    ) {
      setQueryParams((prev) => ({
        ...prev,
        [conversation.id]: {
          cursor: messages?.length
            ? messages[messages.length - 1].id
            : undefined,
          direction: "DOWN",
        },
      }));
    }
  }, [afterInView.inView, data?.hasMoreDown, messages, isFetching]);

  const isUserInteractedRef = useRef(false);

  const handleMessagesRef = (
    node: Element | null | undefined,
    message: MessageType,
  ) => {
    trackUnreadMessageRef(node, message);
    virtualizer.measureElement(node);
  };

  // Adjust scroll position when new messages are loaded
  // it's important to have it out of effect
  if (messages?.length) {
    const firstId = messages[0].id;
    const addedToTheBeginning = firstId < prevIdRef.current;
    if (addedToTheBeginning && prevCountRef.current > 0) {
      const currentTotalSize = virtualizer.getTotalSize();
      const sizeDifference = currentTotalSize - prevTotalSizeRef.current;
      if (sizeDifference > 0 && virtualizer.scrollOffset !== null) {
        {
          const newOffset = virtualizer.scrollOffset + sizeDifference;
          virtualizer.scrollOffset = newOffset;
          virtualizer.calculateRange();
          virtualizer.scrollToOffset(newOffset, { align: "start" });
        }
      }
    }
    prevTotalSizeRef.current = virtualizer.getTotalSize();
    prevIdRef.current = firstId;
    prevCountRef.current = messages.length;
  }

  useEffect(() => {
    // attach to bottom when message is sent
    if (data?.fromUser && attachToBottomRef.current) {
      virtualizer.scrollToIndex(messages.length - 1, {
        align: "end",
      });
      return;
    }

    const savedScrollPosition = scrollPositionsRef.current.get(conversation.id);
    // attach to previous position or to anchor
    if (savedScrollPosition && !isUserInteractedRef.current) {
      requestAnimationFrame(() => {
        virtualizer.scrollToOffset(savedScrollPosition.offset, {
          align: "start",
          behavior: "auto",
        });
      });
    }

    if (!savedScrollPosition && data?.anchor && !isUserInteractedRef.current) {
      requestAnimationFrame(() => {
        const anchorIndex = messages.findIndex((msg) => msg.id === data.anchor);
        if (anchorIndex !== -1) {
          virtualizer.scrollToIndex(anchorIndex, {
            align: "start",
            behavior: "auto",
          });
        }
      });
    }
  }, [messages]);

  // Detect user scroll to prevent attaching to anchor
  const handleUserInteraction = () => {
    isUserInteractedRef.current = true;
  };

  if (!messages) {
    return <div>Loading messages...</div>;
  }

  return (
    <div
      ref={messagesRef}
      className={styles.messages}
      onKeyDown={handleUserInteraction}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onPointerDown={handleUserInteraction}
    >
      {data?.hasMoreUp && (
        <div
          ref={beforeInView.ref}
          style={{
            width: "100%",
            height: "60px",
          }}
        >
          OLDER
        </div>
      )}

      <div>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <ScrollToBottom
            component={messagesRef.current}
            unreadCount={conversation.unreadMessages}
            conversationId={conversation.id}
            onClick={scrollToBottom}
          />
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            return (
              <Message
                data-index={virtualRow.index}
                key={message.id}
                id={message.id}
                text={message.text}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                read={message.id <= conversation.lastReadIdByParticipants}
                isSentByCurrentUser={message.senderId === user.id}
                createdAt={message.createdAt}
                ref={(node) => handleMessagesRef(node, message)}
              />
            );
          })}
        </div>
      </div>

      {data?.hasMoreDown && (
        <div
          ref={afterInView.ref}
          style={{
            width: "100%",
            height: "60px",
          }}
        >
          NEWER
        </div>
      )}
    </div>
  );
};

export default Messages;
