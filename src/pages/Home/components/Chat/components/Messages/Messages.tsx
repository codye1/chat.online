import { useAppSelector } from "@hooks/hooks";
import { useEffect, useRef, useState } from "react";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import useObserver from "@hooks/useObserver";
import { messagesData } from "../../constants";
import styles from "./Messages.module.css";
import Message from "../Message/Message";

export interface Message {
  id: string;
  text: string;
  userId: string;
  read: boolean;
  createdAt: Date;
}

const Messages = () => {
  const user = useAppSelector((state) => state.auth.user);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(messagesData);
  const didInitialScrollRef = useRef(false);
  const { setRef } = useObserver((entry: IntersectionObserverEntry) => {
    console.log("Message is visible", entry.target.id);
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === entry.target.id
          ? {
              ...message,
              read: true,
            }
          : message,
      ),
    );
  });

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (!user?.id) return;

    const firstUnreadIndex = messages.findIndex(
      (message) => !message.read && message.userId !== user.id,
    );

    if (firstUnreadIndex !== -1) {
      const firstUnreadMessage = document.getElementById(
        messages[firstUnreadIndex].id,
      );
      firstUnreadMessage?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      const messagesEl = messagesRef.current;
      messagesEl?.scrollTo(0, messagesEl.scrollHeight);
    }

    didInitialScrollRef.current = true;
  }, [messages, user?.id]);

  return (
    <div ref={messagesRef} className={styles.messages}>
      {messages.map((message) => (
        <Message
          ref={!message.read && message.userId !== user.id ? setRef : undefined}
          id={message.id}
          key={message.id}
          text={message.text}
          isSentByCurrentUser={message.userId === user.id}
          read={message.read}
          createdAt={message.createdAt}
        />
      ))}
      <ScrollToBottom
        componentRef={messagesRef}
        unreadCount={
          messages.filter(
            (message) => !message.read && message.userId !== user.id,
          ).length
        }
      />
    </div>
  );
};

export default Messages;
