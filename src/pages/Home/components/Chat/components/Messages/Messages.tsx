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
import useControlScroll from "./hook/useControlScroll";
const Messages = ({ conversation }: { conversation: Conversation }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);

  const [queryParams, setQueryParams] = useState<
    Map<
      string,
      {
        cursor?: string;
        direction?: "UP" | "DOWN";
        jumpToLatest?: boolean;
      }
    >
  >(new Map());

  const prevIdRef = useRef("");
  const prevCountRef = useRef(0);
  const prevTotalSizeRef = useRef(0);
  const currentQueryParams = queryParams.get(conversation.id) || {};

  const prevConversationIdRef = useRef(conversation.id);
  const { data: messages, isFetching } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...currentQueryParams,
  });

  const { trackUnreadMessageRef } = useHandleUnreadMessages({
    conversation,
    user,
  });

  const beforeInView = useInView({
    root: rootNode,
    rootMargin: "300px 0px 0px 0px",
  });
  const afterInView = useInView({
    root: rootNode,
    rootMargin: "0px 0px 300px 0px",
  });

  const virtualizer = useVirtualizer({
    count: messages?.items.length || 0,
    getScrollElement: () => rootNode,
    estimateSize: () => 60,
    overscan: 5,
    getItemKey: useCallback(
      (index: number) => messages?.items[index].id || index,
      [messages],
    ),
  });

  // Reset refs when conversation changes
  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== conversation.id) {
      prevIdRef.current = "";
      prevCountRef.current = 0;
      prevTotalSizeRef.current = 0;
    }
  }, [
    conversation.id,
    prevIdRef,
    prevCountRef,
    prevTotalSizeRef,
    prevConversationIdRef,
  ]);

  const scrollToBottom = useCallback(() => {
    if (!rootNode || !messages?.items.length) return;

    if (messages.hasMoreDown) {
      resetUnreadMessagesCount(conversation.id);
      setQueryParams((prev) =>
        prev.set(conversation.id, {
          jumpToLatest: true,
          cursor: undefined,
          direction: undefined,
        }),
      );
    } else {
      virtualizer.scrollToIndex(messages.items.length - 1, {
        align: "end",
        behavior: "smooth",
      });
    }
  }, [rootNode, messages?.items.length, virtualizer, messages?.hasMoreDown]);

  const [, forseUpdate] = useState({});

  useEffect(() => {
    if (beforeInView.inView && messages?.hasMoreUp && !isFetching) {
      setQueryParams((prev) =>
        prev.set(conversation.id, {
          cursor: messages?.items.length ? messages.items[0].id : undefined,
          direction: "UP",
        }),
      );
      forseUpdate({});
    }
  }, [beforeInView.inView, messages?.hasMoreUp, messages?.items, isFetching]);

  useEffect(() => {
    if (
      afterInView.inView &&
      messages?.hasMoreDown &&
      !isFetching &&
      !currentQueryParams.jumpToLatest
    ) {
      setQueryParams((prev) =>
        prev.set(conversation.id, {
          cursor: messages?.items.length
            ? messages.items[messages.items.length - 1].id
            : undefined,
          direction: "DOWN",
        }),
      );
    }
  }, [afterInView.inView, messages?.hasMoreDown, messages?.items, isFetching]);

  useControlScroll({
    conversation,
    messages,
    virtualizer,
    prevConversationIdRef,
  });
  const isUserScrollingRef = useRef(false);
  const handleMessagesRef = (
    node: Element | null | undefined,
    message: MessageType,
  ) => {
    trackUnreadMessageRef(node, message);
    virtualizer.measureElement(node);
  };

  // Adjust scroll position when new messages are loaded
  // it's important to have it out of effect
  // In Messages.tsx, around line 162
  if (messages?.items.length) {
    const firstId = messages.items[0].id;
    const addedToTheBeginning = firstId < prevIdRef.current;

    // ADD THIS CHECK: Only adjust scroll if we're still in the same conversation
    const isSameConversation =
      prevConversationIdRef.current === conversation.id;

    if (addedToTheBeginning && prevCountRef.current > 0 && isSameConversation) {
      const currentTotalSize = virtualizer.getTotalSize();
      const sizeDifference = currentTotalSize - prevTotalSizeRef.current;

      if (sizeDifference > 0 && virtualizer.scrollOffset !== null) {
        if (messages.anchor && !isUserScrollingRef.current) {
          requestAnimationFrame(() => {
            const anchorIndex = messages.items.findIndex(
              (msg) => msg.id === messages.anchor,
            );
            if (anchorIndex !== -1) {
              virtualizer.scrollToIndex(anchorIndex, { align: "start" });
            }
          });
        } else {
          const newOffset = virtualizer.scrollOffset + sizeDifference;

          virtualizer.scrollOffset = newOffset;
          virtualizer.calculateRange();
          virtualizer.scrollToOffset(newOffset, { align: "start" });
        }
      }
    }

    prevTotalSizeRef.current = virtualizer.getTotalSize();
    prevIdRef.current = firstId;
    prevCountRef.current = messages.items.length;
  }
  // Detect user scroll to prevent attaching to anchor

  const handleUserInteraction = () => {
    isUserScrollingRef.current = true;
    console.log(virtualizer.scrollOffset);
  };

  if (!messages) {
    return <div>Loading messages...</div>;
  }

  return (
    <div
      ref={(node) => setRootNode(node)}
      className={styles.messages}
      onKeyDown={handleUserInteraction}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onPointerDown={handleUserInteraction}
    >
      {messages.hasMoreUp && (
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
            component={rootNode}
            unreadCount={conversation.unreadMessages}
            onClick={scrollToBottom}
          />
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages.items[virtualRow.index];
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
                read={message.id <= conversation.lastReadMessageId}
                isSentByCurrentUser={message.senderId === user.id}
                createdAt={message.createdAt}
                ref={(node) => handleMessagesRef(node, message)}
              />
            );
          })}
        </div>
      </div>

      {messages.hasMoreDown && (
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
