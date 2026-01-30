import { useAppSelector } from "@hooks/hooks";
import { useRef } from "react";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import styles from "./Messages.module.css";
import Message from "../Message/Message";
import useObserver from "@hooks/useObserver";
import { markMessageAsRead } from "@utils/socket";
import type { Message as MessageType } from "@utils/types";

const Messages = ({
  messages,
  conversationId,
}: {
  messages: MessageType[];
  conversationId: string;
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const { setRef } = useObserver((entry: IntersectionObserverEntry) => {
    markMessageAsRead(conversationId, entry.target.id, user.id);
  });

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
          ref={
            !message.read && message.senderId !== user.id ? setRef : undefined
          }
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
