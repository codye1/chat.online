import { useAppSelector } from "@hooks/hooks";
import { useState } from "react";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import styles from "./Messages.module.css";
import Message from "../Message/Message";
import { useGetMessagesQuery } from "@api/slices/chatSclice";
import type { Conversation } from "@utils/types";
import usePagination from "./hook/usePagination";
import useHandleUnreadMessages from "./hook/useHandleUnreadMessages";
import useControlScroll from "./hook/useControlScroll";

const Messages = ({ conversation }: { conversation: Conversation }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
  const [queryParams, setQueryParams] = useState<{
    cursor?: string;
    direction?: "UP" | "DOWN";
    jumpToLatest?: boolean;
  }>({});

  const { data: messages, isFetching } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...queryParams,
  });

  const { onScroll, scrollToBottom } = useControlScroll({
    messages,
    rootNode,
    queryParams,
    setQueryParams,
    conversation,
  });

  const { setSentinelRef } = usePagination({
    rootNode,
    messages: messages,
    setQueryParams,
  });

  const { handleMessageRef } = useHandleUnreadMessages({ conversation, user });

  if (!messages) {
    return <div>Loading messages...</div>;
  }

  return (
    <div
      ref={(node) => setRootNode(node)}
      className={styles.messages}
      onScroll={onScroll}
    >
      <ScrollToBottom
        component={rootNode}
        unreadCount={conversation.unreadMessages}
        onClick={scrollToBottom}
      />

      {messages.hasMoreDown && rootNode && !isFetching && (
        <div
          id="DOWN"
          ref={setSentinelRef}
          onClick={() => {
            setQueryParams({
              cursor: messages?.items.length ? messages.items[0].id : undefined,
              direction: "DOWN",
            });
          }}
        >
          (Newer)
        </div>
      )}

      {messages.items.map((message) => (
        <Message
          ref={(node) => handleMessageRef(node, message)}
          id={message.id}
          key={message.id}
          text={message.text}
          isSentByCurrentUser={message.senderId === user.id}
          read={message.id >= conversation.lastReadMessageId}
          createdAt={message.createdAt}
        />
      ))}

      {messages.hasMoreUp && rootNode && !isFetching && (
        <div
          id="UP"
          ref={setSentinelRef}
          onClick={() => {
            setQueryParams({
              cursor: messages?.items.length
                ? messages.items[messages.items.length - 1].id
                : undefined,
              direction: "UP",
            });
          }}
        >
          (Older)
        </div>
      )}
    </div>
  );
};

export default Messages;
