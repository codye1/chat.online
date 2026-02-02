import { useAppSelector } from "@hooks/hooks";
import { useEffect, useRef } from "react";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import styles from "./Messages.module.css";
import Message from "../Message/Message";
import useObserver from "@hooks/useObserver";
import { useGetMessagesQuery } from "@api/slices/chatSclice";
import type { Message as MessageType } from "@utils/types";
import { markMessageAsRead } from "@utils/socket";

const Messages = ({ conversationId }: { conversationId: string }) => {
  const user = useAppSelector((state) => state.auth.user);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const { data: messages } = useGetMessagesQuery({ conversationId });
  const initialScrollDone = useRef(false);
  const firstUnreadMessageId = useRef<HTMLElement | null>(null);
  const { setRef } = useObserver((entry: IntersectionObserverEntry) => {
    if (initialScrollDone.current) {
      console.log("Read " + entry.target.id);
      markMessageAsRead(conversationId, entry.target.id, user.id);
    }
  });

  useEffect(() => {
    if (firstUnreadMessageId.current && !initialScrollDone.current) {
      firstUnreadMessageId.current.scrollIntoView({ block: "center" });
      firstUnreadMessageId.current = null;
      initialScrollDone.current = true;
    }
  }, [messages]);

  const handleMessageRef = (node: HTMLElement | null, message: MessageType) => {
    if (node !== null && !message.read && message.senderId !== user.id) {
      setRef(node);
      // messages has column-reverse, so the first unread message is the last one in the messages data
      firstUnreadMessageId.current = node;
    }
  };

  if (!messages) {
    return <div>Loading messages...</div>;
  }

  return (
    <div ref={messagesRef} className={styles.messages}>
      <ScrollToBottom
        componentRef={messagesRef}
        unreadCount={
          messages.filter(
            (message) => !message.read && message.senderId !== user.id,
          ).length
        }
      />
      {messages.map((message) => (
        <Message
          ref={(node) => handleMessageRef(node, message)}
          id={message.id}
          key={message.id}
          text={message.text}
          isSentByCurrentUser={message.senderId === user.id}
          read={message.read}
          createdAt={message.createdAt}
        />
      ))}
    </div>
  );
};

export default Messages;
