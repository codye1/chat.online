import socket from "@utils/socket";
import type { DirectConversation } from "@utils/types";
import { useEffect } from "react";
import headerStyles from "../Header.module.css";
import getOnlineStatus from "@utils/getOnlineStatus";

interface IDirectHeader {
  conversation: DirectConversation;
}

const DirectHeader = ({ conversation }: IDirectHeader) => {
  useEffect(() => {
    socket.emit("subscribe:lastSeenAt", conversation.otherParticipant.id);
    return () => {
      socket.off("subscribe:lastSeenAt");
    };
  }, [conversation.id]);

  return (
    <span>
      <h1>{conversation.title}</h1>
      {conversation.typingUsers && conversation.typingUsers?.length > 0 && (
        <h2 className={headerStyles.typingUsers}>typing...</h2>
      )}
      {!conversation.typingUsers?.length && (
        <h2>{getOnlineStatus(conversation.lastSeenAt)}</h2>
      )}
    </span>
  );
};

export default DirectHeader;
