import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";
import { useEffect } from "react";
import socket from "@utils/socket";

interface IHeader {
  conversation: Conversation;
}

const getOnlineStatus = (lastSeenAt: string | null): string => {
  if (!lastSeenAt) return "last seen a long time ago";

  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

  return diffInMinutes < 1 ? "online" : "last seen recently";
};

const Header = ({ conversation }: IHeader) => {
  useEffect(() => {
    if (conversation.type === "DIRECT") {
      socket.emit("subscribe:lastSeenAt", conversation.otherParticipant.id);
    }
    return () => {
      socket.off("subscribe:lastSeenAt");
    };
  }, [conversation.id]);
  return (
    <header className={styles.header}>
      <span>
        <h1>{conversation.title}</h1>
        {conversation.type === "DIRECT" &&
          conversation.typingUsers &&
          conversation.typingUsers?.length > 0 && (
            <h2 className={styles.typingUsers}>typing...</h2>
          )}
        {conversation.type === "DIRECT" &&
          !conversation.typingUsers?.length && (
            <h2>{getOnlineStatus(conversation.lastSeenAt)}</h2>
          )}
      </span>
    </header>
  );
};

export default Header;
