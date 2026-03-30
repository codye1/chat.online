import socket from "@utils/socket/socket";
import type { DirectConversation } from "@utils/types";
import { useEffect, type ReactNode } from "react";
import headerStyles from "../Header.module.css";
import getOnlineStatus from "@utils/helpers/getOnlineStatus";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";

interface IDirectHeader {
  conversation: DirectConversation;
  className: string;
  children?: ReactNode;
}

const DirectHeader = ({ conversation, className, children }: IDirectHeader) => {
  useEffect(() => {
    socket.emit("subscribe:lastSeenAt", conversation.otherParticipant.id);
    return () => {
      socket.emit("unsubscribe:lastSeenAt", conversation.otherParticipant.id);
    };
  }, [conversation.otherParticipant.id]);
  const dispatch = useAppDispatch();

  return (
    <header
      className={className}
      onClick={() =>
        dispatch(
          openModal({
            type: "otherUser",
            userPreview: conversation.otherParticipant,
          }),
        )
      }
    >
      {children}
      <span>
        <h1>{conversation.title}</h1>
        {conversation.activeUsers.length > 0 && (
          <h2 className={headerStyles.typingUsers}>
            {conversation.activeUsers[0].reason}
          </h2>
        )}
        {!conversation.activeUsers?.length && (
          <h2>{getOnlineStatus(conversation.lastSeenAt)}</h2>
        )}
      </span>
    </header>
  );
};

export default DirectHeader;
